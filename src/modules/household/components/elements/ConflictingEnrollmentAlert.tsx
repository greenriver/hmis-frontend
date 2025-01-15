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
  receivingHousehold: HouseholdFieldsFragment;
  conflictingEnrollmentId: string;
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
      with the entry date. You have two options:
      <List sx={{ listStyle: 'decimal', pl: 4 }} component='ol'>
        <ListItem sx={{ display: 'list-item' }}>
          {joiningClientName}’s enrollment can be joined with {hohName}’s
          household.
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          To retain the conflicting enrollment, you must first exit{' '}
          {joiningClientName}’s conflicting enrollment, before re-enrolling.
        </ListItem>
      </List>
      <Stack direction='row' gap={2}>
        <Button color='warning' onClick={onClickJoinEnrollment}>
          Join Enrollment
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
