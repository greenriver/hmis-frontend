import { Stack } from '@mui/system';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepDialog, { StepDefinition } from '@/components/elements/StepDialog';
import useSafeParams from '@/hooks/useSafeParams';
import SourceEnrollmentSelector from '@/modules/ce/components/unit/SourceEnrollmentSelector';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import WarningAlert from '@/modules/errors/components/WarningAlert';
import {
  emptyErrorState,
  ErrorState,
  hasAnyValue,
  hasOnlyWarnings,
  partitionValidations,
} from '@/modules/errors/util';
import { cache } from '@/providers/apolloClient';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeCandidateFieldsFragment,
  CeOpportunityFieldsFragment,
  useCreateCeReferralMutation,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  candidate: CeCandidateFieldsFragment; // candidate to refer
  opportunity: CeOpportunityFieldsFragment; // opportunity to refer to
  open: boolean;
  onClose: VoidFunction;
}

/**
 * The StartReferralDialog component provides a multi-step dialog for initiating a referral for a candidate.
 *
 * TODO(#7539) require setting/confirming contacts before referral creation
 */
const StartReferralDialog: React.FC<Props> = ({
  candidate,
  opportunity,
  open,
  onClose,
}) => {
  const navigate = useNavigate();
  const { unitId } = useSafeParams() as {
    unitId: string;
  };

  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<
    string | undefined
  >(undefined);

  const handleClose = useCallback(() => {
    setErrorState(emptyErrorState);
    setSelectedEnrollmentId(undefined);
    onClose();
  }, [onClose]);

  const [createReferral, { loading }] = useCreateCeReferralMutation({
    variables: {
      opportunityId: opportunity.id,
      sourceEnrollmentId: selectedEnrollmentId,
    },
    onCompleted: ({ createCeReferral }) => {
      if (createCeReferral?.referral) {
        const referral = createCeReferral.referral;

        // Evict entire unit from the cache, because "latestOpportunity" and "acceptingCeReferrals"
        // and other CE-related fields will have changed as a result of this referral being created.
        cache.evict({ id: `Unit:${unitId}` });
        navigate(
          generateSafePath(ProjectDashboardRoutes.REFERRAL, {
            projectId: opportunity.projectId,
            referralId: referral.id,
          })
        );
        handleClose();
      } else if (createCeReferral?.errors) {
        setErrorState(partitionValidations(createCeReferral.errors));
      }
    },
    onError: (e) => setErrorState({ ...emptyErrorState, apolloError: e }),
  });

  // Error display from mutation response. Render in whichever step performs the mutation.
  const errorContent = useMemo(
    () => (
      <>
        {errorState && hasAnyValue(errorState) && (
          <Stack gap={1}>
            <ApolloErrorAlert error={errorState.apolloError} inline />
            <ErrorAlert key='errors' errors={errorState.errors} />
            {hasOnlyWarnings(errorState) && (
              <WarningAlert key='warnings' warnings={errorState.warnings} />
            )}
          </Stack>
        )}
      </>
    ),
    [errorState]
  );

  // Define steps in the workflow dialog. The referral creation mutation is performed in the last step.
  const stepDefinitions: StepDefinition[] = useMemo(
    () => [
      {
        title: 'Select Source Enrollment',
        key: 'source-enrollment',
        content: (
          <>
            {errorContent}
            <SourceEnrollmentSelector
              clientName={candidate.clientName}
              candidateId={candidate.id}
              opportunityId={opportunity.id}
              selectedEnrollmentId={selectedEnrollmentId}
              setSelectedEnrollmentId={setSelectedEnrollmentId}
            />
          </>
        ),
        proceedButtonText: 'Create Referral',
        onProceed: () => createReferral(),
        proceedLoading: loading,
        disableProceed: !selectedEnrollmentId,
      },

      /* TODO(#7539) require user to select/confirm contacts before referral creation */
      // {
      //   title: 'Confirm Contacts',
      //   key: 'contacts',
      //   content: (
      //     /*
      //     1) Use a refactored version of AssignContactsForm here, so code can be shared. It should accept the swimlane configuration, because at this point the Referral isn't created yet.
      //     2) Fill in each dropdown with the default contacts for each swimlane, if any. (To be implemented)
      //     */
      //     // <AssignContactsForm
      //     //   // referral={referral}
      //     //   projectId={projectId}
      //     //   onClose={onClose}
      //     // />
      //     <></>
      //   ),
      //   proceedButtonText: 'Create Referral',
      //   onProceed: () => createReferral(),
      //   proceedLoading: loading,
      // },
    ],
    [
      candidate.id,
      candidate.clientName,
      createReferral,
      errorContent,
      loading,
      opportunity.id,
      selectedEnrollmentId,
    ]
  );

  return (
    <StepDialog
      title='Start Referral'
      open={open}
      fullWidth
      maxWidth='md'
      onClose={handleClose}
      stepDefinitions={stepDefinitions}
      enableBackdropClick
    />
  );
};

export default StartReferralDialog;
