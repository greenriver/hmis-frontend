import React, { useMemo } from 'react';
import {
  CommonDetailGridContainer,
  CommonDetailGridItem,
} from '@/components/elements/CommonDetailGrid';
import TitleCard from '@/components/elements/TitleCard';
import OccurrencePointForm from '@/modules/form/components/OccurrencePointForm';
import { useClientDetailForms } from '@/modules/form/hooks/useClientDetailForms';
import { parseOccurrencePointFormDefinition } from '@/modules/form/util/formUtil';
import { ClientFieldsFragment } from '@/types/gqlTypes';

interface Props {
  client: ClientFieldsFragment;
}

const ClientCustomDataElementsCard: React.FC<Props> = ({ client }) => {
  const { forms, loading } = useClientDetailForms();

  const rows = useMemo(
    () =>
      forms.map((form) => {
        const { displayTitle, isEditable, readOnlyDefinition } =
          parseOccurrencePointFormDefinition(form.definition);

        return {
          id: form.id,
          label: displayTitle,
          value: (
            <OccurrencePointForm
              record={client}
              definition={form.definition}
              readOnlyDefinition={readOnlyDefinition}
              editable={isEditable && client.access.canEditClient}
              dialogTitle={displayTitle}
            />
          ),
        };
      }),
    [client, forms]
  );

  if (loading) return null;
  if (rows.length === 0) return null;

  return (
    <TitleCard
      title='Custom Fields'
      headerVariant='border'
      headerTypographyVariant='body1'
    >
      <CommonDetailGridContainer ariaLabel='Custom Client Fields'>
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
