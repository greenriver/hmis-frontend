import { MergeTypeRounded } from '@mui/icons-material';
import { Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import Loading from '@/components/elements/Loading';
import StepDialog, { TabDefinition } from '@/components/elements/StepDialog';
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
  onComplete?: (
    joinedHousehold: HouseholdFieldsFragment,
    remainingHousehold?: HouseholdFieldsFragment | null
  ) => void;
}

const JoinHouseholdDialog = ({
  open,
  onClose,
  onComplete,
  initiatorEnrollmentId,
  receivingHousehold,
  project,
}: Props) => {
  // Data this join workflow is collecting: What clients are joining and what their relationships are
  const [joiningClients, setJoiningClients] = useState<
    HouseholdClientFieldsFragment[]
  >([]);
  const [relationships, setRelationships] = useState<
    Record<string, RelationshipToHoH | null>
  >({});

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
      disabled: missingRelationshipsCount > 0,
      disabledReason:
        missingRelationshipsCount > 0
          ? `Required fields missing (${missingRelationshipsCount})`
          : undefined,
    };
  }, [missingRelationshipsCount]);

  const {
    joinHousehold,
    loading: joinLoading,
    error: joinError,
    joinedHousehold,
    remainingEnrollment,
  } = usePerformJoinHousehold({
    onComplete,
    receivingHousehold,
    joiningClients,
    relationships,
    missingRelationshipsCount,
  });

  const tabDefinitions: TabDefinition[] = useMemo(
    () => [
      {
        title: 'Select Clients',
        content: (
          <>
            {donorHousehold && (
              <JoinHouseholdSelectClients
                donorHousehold={donorHousehold}
                selectedClients={joiningClients}
                setSelectedClients={setJoiningClients}
                receivingHohName={receivingHohName}
              />
            )}
          </>
        ),
        FormDialogActionProps: {
          disabled: joiningClients.length === 0,
          disabledReason: 'Select a client',
        },
      },
      {
        title: 'Add Relationships',
        content: (
          <AddRelationshipsStep
            existingClients={sortHouseholdMembers(
              receivingHousehold.householdClients
            )}
            newClients={joiningClients}
            showNewIndicator={true}
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
              Update joining clients’ relationships{' '}
              {receivingHohName && <>to {receivingHohName}</>}
              {/* todo @martha - add warning here about entry dates, pending conversation with design */}
            </Typography>
          </AddRelationshipsStep>
        ),
        FormDialogActionProps: missingRelationshipsProps,
      },
      {
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
        FormDialogActionProps: {
          ...missingRelationshipsProps,
          submitLoading: joinLoading,
          disabled: joinLoading || missingRelationshipsCount > 0,
        },
      },
    ],
    [
      donorHousehold,
      joinLoading,
      joiningClients,
      missingRelationshipsCount,
      missingRelationshipsProps,
      receivingHohName,
      receivingHousehold,
      relationships,
    ]
  );

  if (fetchError) throw fetchError;
  if (joinError) throw joinError;

  return (
    <StepDialog
      title={'Join Enrollments'}
      submitButtonTitle={'Join Enrollments'}
      SubmitButtonProps={{
        endIcon: <MergeTypeRounded />,
      }}
      successContent={
        joinedHousehold && (
          <SuccessWayfindingStep
            title={'Successful Join'}
            description={`${stringifyHousehold(joiningClients)} ${joiningClients.length > 1 ? 'have' : 'has'} been successfully joined to ${receivingHohName}’s Enrollment at ${project.projectName}`}
            primaryClientName={receivingHohName}
            secondary={remainingEnrollment}
            project={project}
            onClose={onClose}
          />
        )
      }
      loading={fetchLoading}
      open={open}
      fullWidth
      maxWidth='lg'
      onClose={onClose}
      onSubmit={joinHousehold}
      tabDefinitions={tabDefinitions}
    />
  );
};

export default JoinHouseholdDialog;
