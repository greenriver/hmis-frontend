import { Typography } from '@mui/material';
import { useMemo } from 'react';
import {
  sortHouseholdMembers,
  stringifyHousehold,
} from '@/modules/hmis/hmisUtil';
import ReviewHouseholdsStep from '@/modules/household/components/householdActions/ReviewHouseholdsStep';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  splittingClients: HouseholdClientFieldsFragment[];
  donorHousehold: HouseholdFieldsFragment;
  relationships: Record<string, RelationshipToHoH | null>;
}

const SplitHouseholdReview = ({
  splittingClients: splittingClientsProp,
  donorHousehold,
  relationships,
}: Props) => {
  const splitSummary = useMemo(
    () => stringifyHousehold(splittingClientsProp),
    [splittingClientsProp]
  );

  const remaining = useMemo(() => {
    return sortHouseholdMembers(
      donorHousehold.householdClients.filter(
        (hc) => !splittingClientsProp.includes(hc)
      )
    );
  }, [donorHousehold.householdClients, splittingClientsProp]);

  const splittingClients = useMemo(() => {
    return splittingClientsProp.map((c) => {
      return {
        ...c,
        relationshipToHoH:
          relationships[c.enrollment.id] || RelationshipToHoH.DataNotCollected,
      };
    });
  }, [relationships, splittingClientsProp]);

  return (
    <ReviewHouseholdsStep
      reviewableHouseholds={[
        {
          title: 'Remaining Household',
          description: `The household that ${splitSummary} will leave.`,
          members: remaining,
        },
        {
          title: 'Split Household',
          description: `New household that ${splitSummary} will form.`,
          members: splittingClients,
        },
      ]}
    >
      <Typography variant='body1'>
        Check that the remaining and split household members and details are
        correct.
      </Typography>
    </ReviewHouseholdsStep>
  );
};

export default SplitHouseholdReview;
