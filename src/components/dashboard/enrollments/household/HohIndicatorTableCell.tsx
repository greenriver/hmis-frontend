import { Typography } from '@mui/material';

import {
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

const HohIndicatorTableCell = ({
  householdClient,
}: {
  householdClient: HouseholdClientFieldsFragment;
}) => (
  <Typography
    variant='subtitle2'
    color='secondary'
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
);

export default HohIndicatorTableCell;
