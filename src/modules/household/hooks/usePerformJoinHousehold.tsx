import { useCallback, useState } from 'react';
import {
  EnrollmentWithClientNameFieldsFragment,
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
  useJoinHouseholdMutation,
} from '@/types/gqlTypes';

export function usePerformJoinHousehold({
  onComplete,
  receivingHousehold,
  joiningClients,
  relationships,
  missingRelationshipsCount,
}: {
  onComplete?: (
    joinedHousehold: HouseholdFieldsFragment,
    remainingHousehold?: HouseholdFieldsFragment | null
  ) => void;
  receivingHousehold: HouseholdFieldsFragment;
  joiningClients: HouseholdClientFieldsFragment[];
  relationships: Record<string, RelationshipToHoH | null>;
  missingRelationshipsCount: number;
}) {
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
        onComplete?.(data.joinHousehold.receivingHousehold);
      }
    },
  });

  const onSubmit = useCallback(() => {
    if (missingRelationshipsCount > 0) return; // This should never happen; the button will be disabled

    joinHousehold({
      variables: {
        input: {
          receivingHouseholdId: receivingHousehold.id,
          joiningEnrollmentInputs: joiningClients.map((hc) => {
            return {
              // todo @martha - discuss, should we use enrollmentLockVersion?
              enrollmentId: hc.enrollment.id,
              // `|| RelationshipToHoH.DataNotCollected` is to keep typescript happy;
              // thanks to the missingRelationshipsCount logic, we know the relationships will be non-null
              relationshipToHoh:
                relationships[hc.enrollment.id] ||
                RelationshipToHoH.DataNotCollected,
            };
          }),
        },
      },
    });
  }, [
    missingRelationshipsCount,
    joinHousehold,
    receivingHousehold.id,
    joiningClients,
    relationships,
  ]);

  return {
    joinHousehold: onSubmit,
    loading,
    error,
    joinedHousehold,
    remainingEnrollment,
  };
}
