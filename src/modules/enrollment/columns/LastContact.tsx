import { Box } from '@mui/material';
import React from 'react';
import DateWithRelativeTooltip from '@/components/elements/DateWithRelativeTooltip';
import { HmisEnums } from '@/types/gqlEnums';
import { EnrollmentWithOptionalFieldsFragment } from '@/types/gqlTypes';

interface Props {
  enrollment: Pick<EnrollmentWithOptionalFieldsFragment, 'lastContact'>;
}

const LastContact: React.FC<Props> = ({ enrollment }) => {
  if (!enrollment.lastContact) return;

  return (
    <Box whiteSpace='nowrap'>
      <DateWithRelativeTooltip
        dateString={enrollment.lastContact.contactDate}
        preciseTime={false}
      />{' '}
      ({HmisEnums.LastContactType[enrollment.lastContact.contactType]})
    </Box>
  );
};

export default LastContact;
