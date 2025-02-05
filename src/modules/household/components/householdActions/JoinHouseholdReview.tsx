import { Typography } from '@mui/material';
import { uniqBy } from 'lodash-es';
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
  joiningClients: HouseholdClientFieldsFragment[];
  donorHousehold: HouseholdFieldsFragment;
  receivingHousehold: HouseholdFieldsFragment;
  relationships: Record<string, RelationshipToHoH | null>;
}

const JoinHouseholdReview = ({
  joiningClients,
  donorHousehold,
  receivingHousehold,
  relationships,
}: Props) => {
  const joinedHouseholdClients = useMemo(() => {
    return uniqBy(
      [
        // use uniqBy to avoid console warning after the household has been updated in the cache
        ...sortHouseholdMembers(receivingHousehold.householdClients),
        ...joiningClients.map((jc) => {
          return {
            ...jc,
            relationshipToHoH:
              relationships[jc.enrollment.id] ||
              RelationshipToHoH.DataNotCollected,
          };
        }),
      ],
      'id'
    );
  }, [joiningClients, receivingHousehold.householdClients, relationships]);

  const remainingHouseholdClients = useMemo(() => {
    return sortHouseholdMembers(
      donorHousehold.householdClients.filter(
        (hc) => !joiningClients.includes(hc)
      )
    );
  }, [donorHousehold.householdClients, joiningClients]);

  const joining = useMemo(
    () => stringifyHousehold(joiningClients),
    [joiningClients]
  );

  return (
    <ReviewHouseholdsStep
      title='Review Join'
      reviewableHouseholds={[
        {
          title: 'Joining Household',
          description: `The household that ${joining} will join`,
          members: joinedHouseholdClients,
        },
        ...(remainingHouseholdClients
          ? [
              {
                title: 'Remaining Household',
                description: `The household that ${joining} will leave`,
                members: remainingHouseholdClients,
              },
            ]
          : []),
      ]}
    >
      <Typography variant='body1'>
        Check that the joined{' '}
        {remainingHouseholdClients.length > 0 && 'and remaining '}household
        members and details are correct
      </Typography>
    </ReviewHouseholdsStep>
  );
};

export default JoinHouseholdReview;
