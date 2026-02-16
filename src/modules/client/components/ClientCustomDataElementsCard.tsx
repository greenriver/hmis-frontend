import React, { useMemo } from 'react';
import {
  CommonDetailGridContainer,
  CommonDetailGridItem,
} from '@/components/elements/CommonDetailGrid';
import TitleCard from '@/components/elements/TitleCard';
import useAuth from '@/modules/auth/hooks/useAuth';
import OccurrencePointForm from '@/modules/form/components/OccurrencePointForm';
import { useClientDetailForms } from '@/modules/form/hooks/useClientDetailForms';
import { parseOccurrencePointFormDefinition } from '@/modules/form/util/formUtil';
import { ClientFieldsFragment } from '@/types/gqlTypes';

interface Props {
  client: ClientFieldsFragment;
}

const ClientCustomDataElementsCard: React.FC<Props> = ({ client }) => {
  const { forms, loading } = useClientDetailForms();
  const { user } = useAuth();
  const rows = useMemo(
    () =>
      forms.map((form) => {
        // Determine whether this form has any fields that  are editable.
        // Pass the user because there might be fields that are only editable by some users.
        const { displayTitle, isEditable, definitionForDisplay } =
          parseOccurrencePointFormDefinition(form.definition, user!);

        return {
          id: form.id,
          label: displayTitle,
          value: (
            <OccurrencePointForm
              record={client}
              definition={form.definition}
              definitionForDisplay={definitionForDisplay}
              editable={isEditable && client.access.canEditClient}
              dialogTitle={displayTitle}
            />
          ),
        };
      }),
    [client, forms, user]
  );

  if (loading) return null;
  if (rows.length === 0) return null;

  return (
    <TitleCard
      title='Custom Fields'
      headerVariant='border'
      headerComponent='h2'
    >
      <CommonDetailGridContainer>
        {rows.map(({ id, label, value }) => (
          <CommonDetailGridItem label={label} key={id}>
            {value}
          </CommonDetailGridItem>
        ))}
      </CommonDetailGridContainer>
    </TitleCard>
  );
};

export default ClientCustomDataElementsCard;
