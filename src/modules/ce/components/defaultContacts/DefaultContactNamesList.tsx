import { Typography } from '@mui/material';
import { Fragment } from 'react';
import { ErrorIcon } from '@/components/elements/SemanticIcons';
import { CeDefaultContactFieldsFragment } from '@/types/gqlTypes';

interface Props {
  contacts: CeDefaultContactFieldsFragment[];
  italicizeGlobalContacts?: boolean;
}

/**
 * Shared component for displaying CE default contact names.
 * - Shows "Missing" indicator when no contacts are present
 * - Italicizes global contacts (when italicizeGlobalContacts is true)
 * - Shows inactive users with warning color and "(Inactive)" label
 */
const DefaultContactNamesList: React.FC<Props> = ({
  contacts,
  italicizeGlobalContacts = false,
}) => {
  if (contacts.length === 0) {
    return (
      <Typography
        variant='body2'
        color='warning.dark'
        fontWeight='600'
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
      >
        <ErrorIcon sx={{ fontSize: 'inherit' }} />
        <span>Missing</span>
      </Typography>
    );
  }

  return (
    <>
      {contacts.map((contact, idx) => (
        <Fragment key={contact.user.id}>
          {idx > 0 && ', '}
          <Typography
            variant='body2'
            component='span'
            // Show inactive users with warning color
            color={contact.user.active ? 'inherit' : 'warning.dark'}
            // Italicize global contacts for editors, to help indicate how they should be edited.
            // Non-editor users see all contacts unitalicized.
            style={{
              fontStyle:
                !contact.project && italicizeGlobalContacts
                  ? 'italic'
                  : 'normal',
            }}
          >
            {contact.user.name}
            {!contact.user.active && ' (Inactive)'}
          </Typography>
        </Fragment>
      ))}
    </>
  );
};

export default DefaultContactNamesList;
