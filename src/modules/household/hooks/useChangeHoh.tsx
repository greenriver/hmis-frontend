import { useCallback, useMemo, useState } from 'react';

import ValidationDialog from '@/modules/errors/components/ValidationDialog';
import {
  ErrorState,
  emptyErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import {
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
  useUpdateRelationshipToHoHMutation,
} from '@/types/gqlTypes';

interface Args {
  refetchHousehold: VoidFunction;
}

// hook with logic for changing the HoH, and confirmation dialog
export function useChangeHoh({ refetchHousehold }: Args) {
  const [proposedHoh, setProposedHoh] =
    useState<HouseholdClientFieldsFragment | null>(null);
  const [warningsConfirmed, setWarningsConfirmed] = useState(false);
  const [errorState, setErrors] = useState<ErrorState>(emptyErrorState);
  // client to highlight for relationship input
  const [highlight, setHighlight] = useState<string[]>([]);

  const resetState = useCallback(() => {
    setProposedHoh(null);
    setErrors(emptyErrorState);
    setWarningsConfirmed(false);
  }, []);

  const [setHoHMutate, { loading: hohChangeLoading }] =
    useUpdateRelationshipToHoHMutation({
      onCompleted: (data) => {
        if (!data.updateRelationshipToHoH) return;

        if (data.updateRelationshipToHoH.enrollment) {
          // highlight relationship field for non-HOH members
          const members =
            data.updateRelationshipToHoH?.enrollment?.household.householdClients
              .filter(
                (hc) =>
                  hc.relationshipToHoH !== RelationshipToHoH.SelfHeadOfHousehold
              )
              .map((hc) => hc.client.id);
          setHighlight(members || []);
          resetState();
          // refetch, so that all relationships-to-HoH to reload
          refetchHousehold();
        } else if (data.updateRelationshipToHoH.errors.length > 0) {
          const errors = data.updateRelationshipToHoH.errors;
          setErrors(partitionValidations(errors));
        }
      },
      onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
    });

  const onChangeHoh = useCallback(
    (hc: HouseholdClientFieldsFragment, confirmed = false) => {
      setProposedHoh(hc);
      setHoHMutate({
        variables: {
          input: {
            enrollmentId: hc.enrollment.id,
            relationshipToHoH: RelationshipToHoH.SelfHeadOfHousehold,
            confirmed,
          },
        },
      });
    },
    [setHoHMutate]
  );

  const confirmHohDialog = useMemo(() => {
    if (!proposedHoh) return null;
    return (
      <ValidationDialog
        title='Change Head of Household'
        onConfirm={() => {
          if (!proposedHoh) return;
          setWarningsConfirmed(true);
          onChangeHoh(proposedHoh, true);
        }}
        onCancel={resetState}
        loading={warningsConfirmed && hohChangeLoading}
        open
        errorState={errorState}
        // Can use this safely because we know there will always be at least 1 warning when changing the HoH
        warningsLoading={!warningsConfirmed && hohChangeLoading}
      />
    );
  }, [
    errorState,
    hohChangeLoading,
    onChangeHoh,
    proposedHoh,
    resetState,
    warningsConfirmed,
  ]);

  return {
    confirmHohDialog,
    highlight,
    onChangeHoh,
  };
}
