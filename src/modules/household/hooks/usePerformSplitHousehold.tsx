import { useCallback, useState } from 'react';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
  useSplitHouseholdMutation,
} from '@/types/gqlTypes';

export function usePerformSplitHousehold() {
  const [newHousehold, setNewHousehold] = useState<
    HouseholdFieldsFragment | undefined
  >(undefined);

  const [remainingHousehold, setRemainingHousehold] = useState<
    HouseholdFieldsFragment | undefined
  >(undefined);

  const [splitHousehold, { loading, error }] = useSplitHouseholdMutation({
    onCompleted: (data) => {
      if (data.splitHousehold) {
        setNewHousehold(data.splitHousehold.newHousehold);
        setRemainingHousehold(data.splitHousehold.remainingHousehold);
      }
    },
  });

  const performSplitHousehold = useCallback(
    ({
      splittingClients,
      relationships,
    }: {
      splittingClients: HouseholdClientFieldsFragment[];
      relationships: Record<string, RelationshipToHoH | null>;
    }) => {
      // This intentionally re-validates some of the same error cases that the caller also guards against.
      // This hook throws a hard failure, because the caller is expected to guard in a more friendly way (disabled buttons, helper text)
      let hohCount = 0;

      const splittingInputs = splittingClients.map((hc) => {
        const relationship = relationships[hc.enrollment.id];

        if (!relationship) {
          throw new Error(
            `Select relationship for ${clientBriefName(hc.client)}`
          );
        }

        if (relationship === RelationshipToHoH.SelfHeadOfHousehold)
          hohCount += 1;

        return {
          enrollmentId: hc.enrollment.id,
          relationshipToHoh: relationship,
        };
      });

      if (splittingInputs.length === 0) {
        throw new Error('Select at least one client to split');
      }

      if (hohCount !== 1) {
        throw new Error(`There must be exactly 1 HoH in the new household`);
      }

      return splitHousehold({
        variables: {
          input: {
            splittingEnrollmentInputs: splittingInputs,
          },
        },
      });
    },
    [splitHousehold]
  );

  return {
    performSplitHousehold,
    loading,
    error,
    newHousehold,
    remainingHousehold,
  };
}
