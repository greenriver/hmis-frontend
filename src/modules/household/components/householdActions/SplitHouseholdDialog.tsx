import React, { useCallback, useMemo, useState } from 'react';
import { SplitIcon } from '@/components/elements/SemanticIcons';
import StepDialog, { StepDefinition } from '@/components/elements/StepDialog';
import SplitHouseholdAddRelationships from '@/modules/household/components/householdActions/SplitHouseholdAddRelationships';
import SplitHouseholdReview from '@/modules/household/components/householdActions/SplitHouseholdReview';
import SplitHouseholdSelectClients from '@/modules/household/components/householdActions/SplitHouseholdSelectClients';
import SplitHouseholdSuccess from '@/modules/household/components/householdActions/SplitHouseholdSuccess';
import { usePerformSplitHousehold } from '@/modules/household/hooks/usePerformSplitHousehold';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  ProjectAllFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  open: boolean;
  onClose: VoidFunction;
  donorHousehold: HouseholdFieldsFragment;
  initiator: HouseholdClientFieldsFragment;
  project: Pick<ProjectAllFieldsFragment, 'id' | 'projectName'>;
}

const SplitHouseholdDialog = ({
  open,
  onClose,
  donorHousehold,
  initiator,
  project,
}: Props) => {
  const [splittingClients, setSplittingClients] = useState<
    HouseholdClientFieldsFragment[]
  >([initiator]);

  const [relationships, setRelationships] = useState<
    Record<string, RelationshipToHoH | null>
  >({});

  const missingRelationshipsCount = useMemo(
    () =>
      splittingClients.filter((jc) => !relationships[jc.enrollment.id]).length,
    [splittingClients, relationships]
  );

  const hohCount = useMemo(
    () =>
      Object.values(relationships).filter(
        (r) => r === RelationshipToHoH.SelfHeadOfHousehold
      ).length,
    [relationships]
  );

  const disabledProps = useMemo(() => {
    let disabledReason = undefined;
    if (hohCount === 0) disabledReason = 'Invalid Inputs (Select a HoH)';
    if (hohCount > 1)
      disabledReason = `Invalid Inputs (${hohCount} HoH selected)`;
    if (missingRelationshipsCount > 0)
      disabledReason = `Required fields missing (${missingRelationshipsCount})`;

    return {
      disableProceed: hohCount !== 1 || missingRelationshipsCount > 0,
      disabledReason: disabledReason,
    };
  }, [hohCount, missingRelationshipsCount]);

  const {
    performSplitHousehold,
    loading,
    error,
    newHousehold,
    remainingHousehold,
  } = usePerformSplitHousehold();

  const onSubmit = useCallback(
    () =>
      performSplitHousehold({
        splittingClients,
        relationships,
      }),
    [performSplitHousehold, relationships, splittingClients]
  );

  const stepDefinitions: StepDefinition[] = useMemo(
    () => [
      {
        title: 'Select Clients',
        key: 'select',
        content: (
          <>
            {donorHousehold && (
              <SplitHouseholdSelectClients
                donorHousehold={donorHousehold}
                selectedClients={splittingClients}
                setSelectedClients={setSplittingClients}
              />
            )}
          </>
        ),
        disableProceed: splittingClients.length === 0,
        disabledReason: 'Select a client',
      },
      {
        title: 'Add Relationships',
        key: 'relationships',
        content: (
          <SplitHouseholdAddRelationships
            householdClients={splittingClients}
            relationships={relationships}
            hohCount={hohCount}
            updateRelationship={(enrollmentId, relationship) => {
              setRelationships((prev) => {
                return {
                  ...prev,
                  [enrollmentId]: relationship,
                };
              });
            }}
          />
        ),
        ...disabledProps,
        onOpen: () => {
          if (splittingClients.length === 1) {
            setRelationships({
              [splittingClients[0].enrollment.id]:
                RelationshipToHoH.SelfHeadOfHousehold,
            });
          }
        },
      },
      {
        title: 'Review Split',
        key: 'review',
        content: (
          <SplitHouseholdReview
            splittingClients={splittingClients}
            donorHousehold={donorHousehold}
            relationships={relationships}
          />
        ),
        onProceed: onSubmit,
        proceedLoading: loading,
        proceedButtonText: 'Split Enrollments',
        ButtonProps: { endIcon: <SplitIcon /> },
        ...disabledProps,
        disableProceed: loading || disabledProps.disableProceed,
      },
      {
        key: 'success',
        content: (
          <SplitHouseholdSuccess
            splitHousehold={newHousehold}
            donorHousehold={remainingHousehold}
            initiator={initiator}
            project={project}
            onClose={onClose}
          />
        ),
      },
    ],
    [
      donorHousehold,
      splittingClients,
      relationships,
      hohCount,
      disabledProps,
      onSubmit,
      loading,
      newHousehold,
      remainingHousehold,
      initiator,
      project,
      onClose,
    ]
  );

  if (error) throw error;

  return (
    <StepDialog
      title={'Split Enrollments'}
      open={open}
      fullWidth
      maxWidth='md'
      onClose={onClose}
      stepDefinitions={stepDefinitions}
    />
  );
};

export default SplitHouseholdDialog;
