import { Alert, AlertTitle, Button, Stack } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import StepDialog from '@/components/elements/StepDialog';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import JoinHouseholdAddRelationships from '@/modules/household/components/elements/JoinHouseholdAddRelationships';
import JoinHouseholdReviewJoin from '@/modules/household/components/elements/JoinHouseholdReviewJoin';
import JoinHouseholdSelectClients from '@/modules/household/components/elements/JoinHouseholdSelectClients';
import {
  EnrollmentWithHouseholdFieldsFragment,
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
  useJoinHouseholdsMutation,
} from '@/types/gqlTypes';

interface Props {
  open: boolean;
  conflictingEnrollment: EnrollmentWithHouseholdFieldsFragment;
  onClose: VoidFunction;
  receivingHousehold: HouseholdFieldsFragment;
}

const JoinHouseholdDialog = ({
  open,
  onClose,
  conflictingEnrollment,
  receivingHousehold,
}: Props) => {
  const initiator = useMemo(() => {
    // todo @martha - cast is safe, there will always be an initiator
    // but add comments about why doing this - need to get the HouseholdClient object
    return conflictingEnrollment.household.householdClients.find(
      (hc) => hc.client.id === conflictingEnrollment.client.id
    ) as HouseholdClientFieldsFragment;
  }, [
    conflictingEnrollment.client.id,
    conflictingEnrollment.household.householdClients,
  ]);

  const initiatorClientName = clientBriefName(initiator.client);

  const [joiningClients, setJoiningClients] = useState<
    HouseholdClientFieldsFragment[]
  >([initiator]);

  // todo @martha = |nul here allows to set the dropdown back to null, but we want to disable the action (going to the next step) unless all are fileld out
  const [relationships, setRelationships] = useState<
    Record<string, RelationshipToHoH | null>
  >({});

  // on success - move this
  const [joinedHousehold, setJoinedHousehold] =
    useState<HouseholdFieldsFragment | null>(null);
  const [joinHousehold, { loading: joinLoading, error: joinError }] =
    useJoinHouseholdsMutation({
      onCompleted: (data) => {
        if (data.joinHouseholds?.household) {
          setJoinedHousehold(receivingHousehold);
        }
      },
    });
  // todo @martha - deal with errors and loading
  console.log(joinLoading);
  console.log(joinError);

  const onSubmit = useCallback(() => {
    joinHousehold({
      variables: {
        input: {
          receivingHouseholdId: receivingHousehold.id,
          joiningEnrollmentInputs: joiningClients.map((hc) => {
            return {
              enrollmentId: hc.enrollment.id,
              relationshipToHoh: relationships[hc.id],
            };
          }),
        },
      },
    });
  }, [joinHousehold, receivingHousehold.id, joiningClients, relationships]);

  return (
    <StepDialog
      title={`Enroll ${initiatorClientName}`}
      open={open}
      fullWidth
      maxWidth='lg'
      onClose={onClose}
      onSubmit={onSubmit}
      tabDefinitions={[
        {
          title: 'Select Clients',
          content: (
            <JoinHouseholdSelectClients
              donorHousehold={conflictingEnrollment.household}
              selectedClients={joiningClients}
              setSelectedClients={setJoiningClients}
            />
          ),
        },
        {
          title: 'Add Relationships',
          content: (
            <JoinHouseholdAddRelationships
              joiningClients={joiningClients}
              relationships={relationships}
              updateRelationship={(householdClientId, relationship) => {
                setRelationships((prev) => {
                  return {
                    ...prev,
                    [householdClientId]: relationship,
                  };
                });
              }}
              receivingHousehold={receivingHousehold}
            />
          ),
        },
        {
          title: 'Review Join',
          content: joinedHousehold ? (
            <>
              <Stack gap={2}>
                <Alert color='success'>
                  <AlertTitle>Successful join</AlertTitle>
                  [Client name] and [x] other members enrollment[s] have have
                  been successfully joined to [hoh name]’s Enrollment at
                  [project name]
                </Alert>
                <Button>Return to [Client 1]'s Enrollment</Button>
                <Button variant='outlined'>View [Client 2]'s Enrollment</Button>
                <Button variant='outlined'>
                  View Enrollments at [Project]
                </Button>
              </Stack>
            </>
          ) : (
            <JoinHouseholdReviewJoin
              joiningClients={joiningClients}
              receivingHousehold={receivingHousehold}
              donorHousehold={conflictingEnrollment.household}
              relationships={relationships}
            />
          ),
        },
      ]}
    />
  );
};

export default JoinHouseholdDialog;
