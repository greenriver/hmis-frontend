import {
  Alert,
  AlertTitle,
  Button,
  List,
  ListItem,
  Stack,
} from '@mui/material';
import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  ClientWithAlertFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  joiningClient: ClientWithAlertFieldsFragment;
  conflictingEnrollmentId: string;
  receivingHousehold: HouseholdFieldsFragment;
  onClickJoinEnrollment: VoidFunction;
}

const ConflictingEnrollmentAlert = ({
  joiningClient,
  receivingHousehold,
  conflictingEnrollmentId,
  onClickJoinEnrollment,
}: Props) => {
  const joiningClientName = clientBriefName(joiningClient);

  const hohName = useMemo(() => {
    const hoh = receivingHousehold.householdClients.find(
      (hc) => hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
    );
    if (!hoh) return '';
    return clientBriefName(hoh.client);
  }, [receivingHousehold.householdClients]);

  return (
    <Alert severity='warning'>
      <AlertTitle>Conflicting Enrollment</AlertTitle>
      {joiningClientName} has another enrollment in this project that conflicts
      with this enrollment. You have two options:
      <List sx={{ listStyle: 'decimal', pl: 4 }} component='ol'>
        <ListItem sx={{ display: 'list-item' }}>
          {joiningClientName}’s enrollment can be joined with {hohName}’s
          household.
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          To retain {joiningClientName}’s enrollment, you must first edit the
          entry and/or exit dates so that it does not conflict, before
          re-enrolling.
        </ListItem>
      </List>
      <Stack direction='row' gap={2}>
        <Button color='warning' onClick={onClickJoinEnrollment}>
          Join Enrollments
        </Button>
        <ButtonLink
          to={generatePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
            clientId: joiningClient.id,
            enrollmentId: conflictingEnrollmentId,
          })}
          variant='contained'
          color='grayscale'
        >
          View Conflicting Enrollment
        </ButtonLink>
      </Stack>
    </Alert>
  );
};

export default ConflictingEnrollmentAlert;
