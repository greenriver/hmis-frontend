import { Typography } from '@mui/material';
import React from 'react';
import CommonCard from '@/components/elements/CommonCard';
import EditIconButton from '@/components/elements/EditIconButton';
import { UnitGroupDetailFieldsFragment } from '@/types/gqlTypes';

interface Props {
  unitGroup: UnitGroupDetailFieldsFragment;
  canEdit?: boolean;
}

// TODO(#7538) implement
const UnitGroupDefaultContactsCard: React.FC<Props> = ({ canEdit = false }) => {
  const assignContactsText = (
    <Typography variant='inherit' color='error.dark'>
      Assign Contacts
    </Typography>
  );

  return (
    <CommonCard
      title='Default Contacts'
      actions={canEdit && <EditIconButton title='Assign Contacts' />}
    >
      {assignContactsText}
    </CommonCard>
  );
};

export default UnitGroupDefaultContactsCard;
