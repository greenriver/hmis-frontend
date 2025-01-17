import { MergeTypeRounded } from '@mui/icons-material';
import { useCallback, useMemo, useState } from 'react';
import Loading from '@/components/elements/Loading';
import StepDialog, { TabDefinition } from '@/components/elements/StepDialog';
import { clientBriefName, findHohOrRep } from '@/modules/hmis/hmisUtil';
import JoinHouseholdAddRelationships from '@/modules/household/components/elements/JoinHouseholdAddRelationships';
import JoinHouseholdReview from '@/modules/household/components/elements/JoinHouseholdReview';
import JoinHouseholdSelectClients from '@/modules/household/components/elements/JoinHouseholdSelectClients';
import JoinHouseholdSuccess from '@/modules/household/components/elements/JoinHouseholdSuccess';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  ProjectAllFieldsFragment,
  RelationshipToHoH,
  useGetEnrollmentWithHouseholdQuery,
  useJoinHouseholdsMutation,
} from '@/types/gqlTypes';

interface Props {
  open: boolean;
  conflictingEnrollmentId: string;
  onClose: VoidFunction;
  onComplete?: (
    joinedHousehold: HouseholdFieldsFragment,
    remainingHousehold?: HouseholdFieldsFragment | null
  ) => void;
  receivingHousehold: HouseholdFieldsFragment;
  project: Pick<ProjectAllFieldsFragment, 'id' | 'projectName'>;
}

const JoinHouseholdDialog = ({
  open,
  onClose,
  onComplete,
  conflictingEnrollmentId,
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

  // Fetch the conflicting enrollment by ID since we need the full EnrollmentWithHousehold
  const {
    data: { enrollment: conflictingEnrollment } = {},
    loading: fetchLoading,
    error: fetchError,
  } = useGetEnrollmentWithHouseholdQuery({
    variables: {
      id: conflictingEnrollmentId,
    },
    onCompleted: (data) => {
      if (data?.enrollment?.household) {
        const household = data?.enrollment?.household;
        const initiator = household?.householdClients.find(
          (hc) => hc.enrollment.id === conflictingEnrollmentId
        );

        if (initiator) {
          // Once the household loads, set the joining clients list to the initiating client
          // (the one with the conflicting enrollment), plus if they are the HoH, all their household members.
          if (
            initiator.relationshipToHoH ===
            RelationshipToHoH.SelfHeadOfHousehold
          ) {
            setJoiningClients(household.householdClients);
          } else {
            setJoiningClients([initiator]);
          }
        }
      }
    },
  });

  const donorHousehold = useMemo(
    () => conflictingEnrollment?.household,
    [conflictingEnrollment]
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
          ? `Missing ${missingRelationshipsCount} required fields`
          : undefined,
    };
  }, [missingRelationshipsCount]);

  const [joinedHousehold, setJoinedHousehold] = useState<
    HouseholdFieldsFragment | undefined
  >(undefined);
  const [remainingHousehold, setRemainingHousehold] = useState<
    HouseholdFieldsFragment | undefined
  >(undefined);
  const [joinHousehold, { loading: joinLoading, error: joinError }] =
    useJoinHouseholdsMutation({
      onCompleted: (data) => {
        if (data.joinHouseholds) {
          setJoinedHousehold(data.joinHouseholds.receivingHousehold);
          setRemainingHousehold(
            data.joinHouseholds.donorHousehold || undefined
          );
          onComplete?.(
            data.joinHouseholds.receivingHousehold,
            data.joinHouseholds.donorHousehold
          );
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
          <JoinHouseholdAddRelationships
            joiningClients={joiningClients}
            relationships={relationships}
            updateRelationship={(enrollmentId, relationship) => {
              setRelationships((prev) => {
                return {
                  ...prev,
                  [enrollmentId]: relationship,
                };
              });
            }}
            receivingHousehold={receivingHousehold}
            receivingHohName={receivingHohName}
          />
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
          <JoinHouseholdSuccess
            receivingHohName={receivingHohName}
            joinedClients={joiningClients}
            remainingHousehold={remainingHousehold}
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
      onSubmit={onSubmit}
      tabDefinitions={tabDefinitions}
    />
  );
};

export default JoinHouseholdDialog;
