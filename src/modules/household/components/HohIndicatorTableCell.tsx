import { Typography } from '@mui/material';

import {
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

const HohIndicatorTableCell = ({
  householdClient,
}: {
  householdClient: HouseholdClientFieldsFragment;
}) => {
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
      {householdClient.relationshipToHoH ===
        RelationshipToHoH.SelfHeadOfHousehold && 'HoH'}
    </Typography>
    // </Tooltip>
  );
};

export default HohIndicatorTableCell;
