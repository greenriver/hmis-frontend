import { Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import Loading from '@/components/elements/Loading';
import { JoinIcon } from '@/components/elements/SemanticIcons';
import StepDialog, { StepDefinition } from '@/components/elements/StepDialog';
import {
  clientBriefName,
  findHohOrRep,
  sortHouseholdMembers,
  stringifyHousehold,
} from '@/modules/hmis/hmisUtil';
import AddRelationshipsStep from '@/modules/household/components/householdActions/AddRelationshipsStep';
import JoinHouseholdReview from '@/modules/household/components/householdActions/JoinHouseholdReview';
import JoinHouseholdSelectClients from '@/modules/household/components/householdActions/JoinHouseholdSelectClients';
import SuccessWayfindingStep from '@/modules/household/components/householdActions/SuccessWayfindingStep';
import { usePerformJoinHousehold } from '@/modules/household/hooks/usePerformJoinHousehold';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  ProjectAllFieldsFragment,
  RelationshipToHoH,
  useGetEnrollmentWithHouseholdQuery,
} from '@/types/gqlTypes';

interface Props {
  open: boolean;
  initiatorEnrollmentId: string;
  receivingHousehold: HouseholdFieldsFragment;
  project: Pick<ProjectAllFieldsFragment, 'id' | 'projectName'>;
  onClose: VoidFunction;
  onSuccess?: (joinedHousehold: HouseholdFieldsFragment) => void;
}

const JoinHouseholdDialog = ({
  open,
  onClose,
  onSuccess,
  initiatorEnrollmentId,
  receivingHousehold,
  project,
}: Props) => {
  // `joiningClients` and `relationships` are shared across steps, so they are hoisted up and managed here.
  // These pieces of state are updated live as soon as a user makes a selection within a step.
  // Except for the `onSubmit` (joinHousehold mutation), the buttons to navigate between steps
  // are purely navigational and don't submit anything.
  const [joiningClients, setJoiningClients] = useState<
    HouseholdClientFieldsFragment[]
  >([]);
  const [relationships, setRelationships] = useState<
    Record<string, RelationshipToHoH | null>
  >({});

  // When client selection changes, reset relationships
  const setSelectedClients = useCallback(
    (clients: HouseholdClientFieldsFragment[]) => {
      setJoiningClients(clients);
      setRelationships({});
    },
    []
  );

  // Fetch the initiator's enrollment by ID since we need the full EnrollmentWithHousehold
  const {
    data: { enrollment: initiatorEnrollment } = {},
    loading: fetchLoading,
    error: fetchError,
  } = useGetEnrollmentWithHouseholdQuery({
    variables: { id: initiatorEnrollmentId },
    onCompleted: (data) => {
      const household = data?.enrollment?.household;

      const initiator = household?.householdClients.find(
        (hc) => hc.enrollment.id === initiatorEnrollmentId
      );

      if (!household || !initiator) {
        throw new Error(`Enrollment ${initiatorEnrollmentId} not found`);
      }

      // Set the joining clients list to the initiator client, plus, if they are the HoH, all their household members.
      if (
        initiator.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
      ) {
        setJoiningClients(sortHouseholdMembers(household.householdClients));
      } else {
        setJoiningClients([initiator]);
      }
    },
  });

  const donorHousehold = useMemo(
    () => initiatorEnrollment?.household,
    [initiatorEnrollment]
  );

  const receivingHoh = useMemo(
    () => findHohOrRep(receivingHousehold.householdClients),
    [receivingHousehold.householdClients]
  );

  const receivingHohName = useMemo(() => {
    return clientBriefName(receivingHoh.client);
  }, [receivingHoh]);

  const missingRelationshipsCount = useMemo(
    () =>
      joiningClients.filter((jc) => !relationships[jc.enrollment.id]).length,
    [joiningClients, relationships]
  );

  const missingRelationshipsProps = useMemo(() => {
    return {
      disableProceed: missingRelationshipsCount > 0,
      disabledReason:
        missingRelationshipsCount > 0
          ? `Required fields missing (${missingRelationshipsCount})`
          : undefined,
    };
  }, [missingRelationshipsCount]);

  const {
    performJoinHousehold,
    loading: joinLoading,
    error: joinError,
    remainingHousehold,
  } = usePerformJoinHousehold({ onSuccess });

  const onSubmit = useCallback(
    () =>
      performJoinHousehold({
        receivingHouseholdId: receivingHousehold.id,
        joiningClients,
        relationships,
      }),
    [joiningClients, performJoinHousehold, receivingHousehold.id, relationships]
  );

  const stepDefinitions: StepDefinition[] = useMemo(
    () => [
      {
        key: 'select',
        title: 'Select Clients',
        content: (
          <>
            {donorHousehold && (
              <JoinHouseholdSelectClients
                donorHousehold={donorHousehold}
                selectedClients={joiningClients}
                setSelectedClients={setSelectedClients}
                receivingHohName={receivingHohName}
              />
            )}
          </>
        ),
        disableProceed: joiningClients.length === 0,
        disabledReason: 'Select a client',
      },
      {
        key: 'relationships',
        title: 'Add Relationships',
        content: (
          <AddRelationshipsStep
            existingClients={sortHouseholdMembers(
              receivingHousehold.householdClients
            )}
            newClients={joiningClients}
            showNewIndicator={true}
            enableSelectingHoh={false}
            relationships={relationships}
            updateRelationship={(enrollmentId, relationship) => {
              setRelationships((prev) => {
                return {
                  ...prev,
                  [enrollmentId]: relationship,
                };
              });
            }}
          >
            <Typography variant='body1'>
              Update joining clients’ relationships
              {receivingHohName && <> to {receivingHohName}</>}.
            </Typography>
          </AddRelationshipsStep>
        ),
        ...missingRelationshipsProps,
      },
      {
        key: 'review',
        title: 'Review Join',
        content: !donorHousehold ? (
          <Loading />
        ) : (
          <JoinHouseholdReview
            joiningClients={joiningClients}
            receivingHousehold={receivingHousehold}
            donorHousehold={donorHousehold}
            relationships={relationships}
          />
        ),
        ...missingRelationshipsProps,
        onProceed: onSubmit,
        proceedLoading: joinLoading,
        proceedButtonText: 'Join Enrollments',
        ButtonProps: {
          endIcon: <JoinIcon />,
        },
        disabled: joinLoading || missingRelationshipsCount > 0,
      },
      {
        key: 'success',
        content: (
          <SuccessWayfindingStep
            title={'Successful Join'}
            description={`${stringifyHousehold(joiningClients)} ${joiningClients.length > 1 ? 'have' : 'has'} been successfully joined to ${receivingHohName}’s Enrollment at ${project.projectName}.`}
            primaryClientName={receivingHohName}
            secondary={findHohOrRep(remainingHousehold?.householdClients || [])}
            project={project}
            onClose={onClose}
          />
        ),
      },
    ],
    [
      donorHousehold,
      joinLoading,
      joiningClients,
      missingRelationshipsCount,
      missingRelationshipsProps,
      onClose,
      onSubmit,
      project,
      receivingHohName,
      receivingHousehold,
      relationships,
      remainingHousehold?.householdClients,
      setSelectedClients,
    ]
  );

  if (fetchError) throw fetchError;
  if (joinError) throw joinError;

  return (
    <StepDialog
      title={'Join Enrollments'}
      loading={fetchLoading}
      open={open}
      fullWidth
      maxWidth='md'
      onClose={onClose}
      stepDefinitions={stepDefinitions}
    />
  );
};

export default JoinHouseholdDialog;
