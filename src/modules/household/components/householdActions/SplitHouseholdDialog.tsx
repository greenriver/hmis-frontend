import { useCallback, useMemo, useState } from 'react';
import { SplitIcon } from '@/components/elements/SemanticIcons';
import StepDialog, { TabDefinition } from '@/components/elements/StepDialog';
import SplitHouseholdAddRelationships from '@/modules/household/components/householdActions/SplitHouseholdAddRelationships';
import SplitHouseholdReview from '@/modules/household/components/householdActions/SplitHouseholdReview';
import SplitHouseholdSelectClients from '@/modules/household/components/householdActions/SplitHouseholdSelectClients';
import SplitHouseholdSuccess from '@/modules/household/components/householdActions/SplitHouseholdSuccess';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  ProjectAllFieldsFragment,
  RelationshipToHoH,
  useSplitHouseholdMutation,
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
      disabled: hohCount !== 1 || missingRelationshipsCount > 0,
      disabledReason: disabledReason,
    };
  }, [hohCount, missingRelationshipsCount]);

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
  //
  const onSubmit = useCallback(() => {
    // These should never happen; the button will be disabled
    if (missingRelationshipsCount > 0) return;
    if (hohCount !== 1) return;

    splitHousehold({
      variables: {
        input: {
          splittingEnrollmentInputs: splittingClients.map((hc) => {
            return {
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
    hohCount,
    missingRelationshipsCount,
    relationships,
    splitHousehold,
    splittingClients,
  ]);

  const tabDefinitions: TabDefinition[] = useMemo(
    () => [
      {
        title: 'Select Clients',
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
        FormDialogActionProps: {
          disabled: splittingClients.length === 0,
          disabledReason: 'Select a client',
        },
      },
      {
        title: 'Add Relationships',
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
        FormDialogActionProps: disabledProps,
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
        content: (
          <SplitHouseholdReview
            splittingClients={splittingClients}
            donorHousehold={donorHousehold}
            relationships={relationships}
          />
        ),
        FormDialogActionProps: {
          ...disabledProps,
          submitLoading: loading,
          disabled: loading || disabledProps.disabled,
        },
      },
    ],
    [
      donorHousehold,
      splittingClients,
      relationships,
      hohCount,
      disabledProps,
      loading,
    ]
  );

  if (error) throw error;

  return (
    <StepDialog
      title={'Split Enrollments'}
      submitButtonTitle={'Split Enrollments'}
      SubmitButtonProps={{
        endIcon: <SplitIcon />,
      }}
      successContent={
        newHousehold &&
        remainingHousehold && (
          <SplitHouseholdSuccess
            splitHousehold={newHousehold}
            donorHousehold={remainingHousehold}
            project={project}
            onClose={onClose}
          />
        )
      }
      open={open}
      fullWidth
      maxWidth='lg'
      onClose={onClose}
      onSubmit={onSubmit}
      tabDefinitions={tabDefinitions}
    />
  );
};

export default SplitHouseholdDialog;
