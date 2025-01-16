import { MergeTypeRounded } from '@mui/icons-material';
import { ReactNode, useCallback, useMemo, useState } from 'react';
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
  RelationshipToHoH,
  useGetEnrollmentWithHouseholdQuery,
  useJoinHouseholdsMutation,
} from '@/types/gqlTypes';

interface Props {
  open: boolean;
  conflictingEnrollmentId: string;
  onClose: VoidFunction;
  receivingHousehold: HouseholdFieldsFragment;
  clientAlertsComponent: ReactNode;
  projectId: string;
  projectName: string;
}

const JoinHouseholdDialog = ({
  open,
  onClose,
  conflictingEnrollmentId,
  receivingHousehold,
  clientAlertsComponent,
  projectId,
  projectName,
}: Props) => {
  const [joiningClients, setJoiningClients] = useState<
    HouseholdClientFieldsFragment[]
  >([]);

  // todo @martha - need to use enrollmentLockVersion?
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

  const [relationships, setRelationships] = useState<
    Record<string, RelationshipToHoH | null>
  >({});

  // todo @martha on success - move this, make this prettier, it's so messy now, deal with errors
  const [joinedHousehold, setJoinedHousehold] = useState<
    HouseholdFieldsFragment | undefined
  >(undefined);
  const [remainingHousehold, setRemainingHousehold] = useState<
    HouseholdFieldsFragment | undefined
  >(undefined);
  const [joinHousehold, { loading: joinLoading, error: joinError }] =
    useJoinHouseholdsMutation({
      onCompleted: (data) => {
        if (data.joinHouseholds?.receivingHousehold) {
          setJoinedHousehold(data.joinHouseholds?.receivingHousehold);
        }
        if (data.joinHouseholds?.donorHousehold) {
          setRemainingHousehold(data.joinHouseholds.donorHousehold);
        }
      },
    });

  const onSubmit = useCallback(() => {
    joinHousehold({
      variables: {
        input: {
          receivingHouseholdId: receivingHousehold.id,
          joiningEnrollmentInputs: joiningClients.map((hc) => {
            return {
              enrollmentId: hc.enrollment.id,
              relationshipToHoh:
                relationships[hc.enrollment.id] ||
                RelationshipToHoH.DataNotCollected, // todo @martha 1 - this should never be dnc,
              // also the fact that I specify it twice is its own problem
            };
          }),
        },
      },
    });
  }, [joinHousehold, receivingHousehold.id, joiningClients, relationships]);

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
                clientAlertsComponent={clientAlertsComponent}
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
        // todo @martha - actually test what happens if there is an error (like server error). you want to stay inside the dialog
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
      clientAlertsComponent,
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

  // const handleClose

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
            projectId={projectId}
            projectName={projectName}
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
