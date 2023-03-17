import { Typography } from '@mui/material';

import { RelationshipToHoH } from '@/types/gqlTypes';

const HohIndicator = ({
  relationshipToHoh,
}: {
  relationshipToHoh: RelationshipToHoH;
}) => {
  if (relationshipToHoh !== RelationshipToHoH.SelfHeadOfHousehold) {
    return null;
  }
  return (
    // <Tooltip title='Head of Household' arrow>
    <Typography
      variant='subtitle2'
      color='text.disabled'
      sx={{
        fontWeight: 600,
        pl: 1,
        pt: 0.5,
        fontSize: '.75rem',
      }}
    >
      HoH
    </Typography>
    // </Tooltip>
  );
};

export default HohIndicator;
