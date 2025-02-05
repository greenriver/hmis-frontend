import { useCallback, useState } from 'react';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import {
  EnrollmentWithClientNameFieldsFragment,
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
  useJoinHouseholdMutation,
} from '@/types/gqlTypes';

export function usePerformJoinHousehold() {
  const [joinedHousehold, setJoinedHousehold] = useState<
    HouseholdFieldsFragment | undefined
  >(undefined);

  const [remainingEnrollment, setRemainingEnrollment] = useState<
    EnrollmentWithClientNameFieldsFragment | undefined
  >(undefined);

  const [joinHousehold, { loading, error }] = useJoinHouseholdMutation({
    onCompleted: (data) => {
      if (data.joinHousehold) {
        setJoinedHousehold(data.joinHousehold.receivingHousehold);
        setRemainingEnrollment(data.joinHousehold.donorEnrollment || undefined);
      }
    },
  });

  const performJoinHousehold = useCallback(
    ({
      receivingHouseholdId,
      joiningClients,
      relationships,
      onSuccess,
    }: {
      receivingHouseholdId: string;
      joiningClients: HouseholdClientFieldsFragment[];
      relationships: Record<string, RelationshipToHoH | null>;
      onSuccess?: (joinedHousehold: HouseholdFieldsFragment) => void;
    }) => {
      const joiningEnrollmentInputs = joiningClients.map((hc) => {
        const relationship = relationships[hc.enrollment.id];

        if (!relationship) {
          // don't really need to aggregate failures here; expect the caller to guard against this by disabling the submit button
          throw new Error(
            `Select relationship for ${clientBriefName(hc.client)}`
          );
        }

        return {
          enrollmentId: hc.enrollment.id,
          relationshipToHoh: relationship,
        };
      });

      if (joiningEnrollmentInputs.length === 0) {
        throw new Error('Select at least one client to join');
      }

      return joinHousehold({
        variables: {
          input: {
            receivingHouseholdId,
            joiningEnrollmentInputs,
          },
        },
        onCompleted: (data) => {
          if (data.joinHousehold) {
            onSuccess?.(data.joinHousehold.receivingHousehold);
          }
        },
      });
    },
    [joinHousehold]
  );

  return {
    performJoinHousehold,
    loading,
    error,
    joinedHousehold,
    remainingEnrollment,
  };
}
