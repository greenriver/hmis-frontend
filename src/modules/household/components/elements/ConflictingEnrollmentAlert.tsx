import { Alert, AlertTitle, Button, Stack } from '@mui/material';
import { generatePath } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { ClientWithAlertFieldsFragment } from '@/types/gqlTypes';

interface Props {
  joiningClient: ClientWithAlertFieldsFragment;
  conflictingEnrollmentId: string;
  onClickJoinEnrollment: VoidFunction;
}

const ConflictingEnrollmentAlert = ({
  joiningClient,
  conflictingEnrollmentId,
  onClickJoinEnrollment,
}: Props) => {
  return (
    <Alert severity='warning'>
      <AlertTitle>Conflicting Enrollment</AlertTitle>
      <Stack direction='column' gap={2}>
        {clientBriefName(joiningClient)} has another enrollment in this project
        that conflicts with this entry date. You have two options:
        {/*todo @martha - add back, see designg*/}
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
      </Stack>
    </Alert>
  );
};

export default ConflictingEnrollmentAlert;
