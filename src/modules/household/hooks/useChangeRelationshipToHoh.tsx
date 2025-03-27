import { Stack, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import { getRequiredLabel } from '@/modules/form/components/RequiredLabel';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import RelationshipToHohSelect from '@/modules/household/components/elements/RelationshipToHohSelect';
import {
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
  useUpdateRelationshipToHoHMutation,
} from '@/types/gqlTypes';

// hook with logic for changing the HoH in a dialog
export function useChangeRelationshipToHoh() {
  // HouseholdClient who's relationship is being changed
  const [member, setMember] = useState<HouseholdClientFieldsFragment>();
  // Proposed Relationship to HoH
  const [relationship, setRelationship] = useState<RelationshipToHoH | null>(
    null
  );
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);
  // Open dialog for specified member
  const openChangeRelationshipDialog = useCallback(
    (hc: HouseholdClientFieldsFragment) => {
      setMember(hc);
      setRelationship(hc.relationshipToHoH || null);
    },
    []
  );

  const resetState = useCallback(() => {
    setMember(undefined);
    setRelationship(null);
    setErrorState(emptyErrorState);
  }, []);

  const [updateRelationship, { loading, error }] =
    useUpdateRelationshipToHoHMutation({
      onCompleted: (data) => {
        const errors = data.updateRelationshipToHoH?.errors || [];
        if (errors.length > 0) {
          setErrorState(partitionValidations(errors));
        } else {
          // on success, reset and close dialog
          // no need to refetch household because cache is updated
          resetState();
        }
      },
    });

  const handleConfirm = useCallback(() => {
    if (!member || !relationship) return;
    updateRelationship({
      variables: {
        input: {
          enrollmentId: member.enrollment.id,
          enrollmentLockVersion: member.enrollment.lockVersion,
          relationshipToHoH: relationship,
          // Changing Rel to HoH (not HoH) has no validation warnings, so just pass confirmed:true.
          // This would need to be updated if we adjust the mutation to return validation warnings.
          confirmed: true,
        },
      },
    });
  }, [member, relationship, updateRelationship]);

  const changeRelationshipDialog = useMemo(() => {
    if (!member) return null;

    return (
      <ConfirmationDialog
        open={!!member}
        onConfirm={handleConfirm}
        onClose={resetState}
        onCancel={resetState}
        loading={loading}
        errorState={errorState}
        title='Change Relationship to HoH'
        confirmText={errorState.warnings.length > 0 ? 'Confirm' : 'Update'}
      >
        <Stack gap={2}>
          <Typography variant='body2'>
            Enter {clientBriefName(member.client)}'s relationship to the Head of
            Household.
          </Typography>
          <RelationshipToHohSelect
            label={getRequiredLabel('Relationship to HoH', true)}
            aria-required
            variant='excludeHoh'
            value={relationship}
            onChange={(_, selected) => setRelationship(selected?.value || null)}
          />
        </Stack>
      </ConfirmationDialog>
    );
  }, [errorState, handleConfirm, loading, member, relationship, resetState]);

  if (error) throw error;

  return { changeRelationshipDialog, openChangeRelationshipDialog };
}
