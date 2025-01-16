import { Alert, AlertTitle, Button, Stack } from '@mui/material';
import React from 'react';
import { generatePath } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import {
  clientBriefName,
  findHohOrRep,
  stringifyHousehold,
} from '@/modules/hmis/hmisUtil';
import {
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
} from '@/routes/routes';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  receivingHohName: string;
  joinedClients: HouseholdClientFieldsFragment[];
  remainingHousehold?: HouseholdFieldsFragment;
  projectId: string;
  projectName: string;
  onClose: VoidFunction;
}

const JoinHouseholdSuccess = ({
  receivingHohName,
  joinedClients,
  remainingHousehold,
  projectId,
  projectName,
  onClose,
}: Props) => {
  // todo @martha - test what actually happens if there is no HoH
  const remainingHouseholdClient = findHohOrRep(
    remainingHousehold?.householdClients || []
  );
  const remainingName = remainingHouseholdClient
    ? clientBriefName(remainingHouseholdClient.client)
    : undefined;

  return (
    <Stack gap={2}>
      <Alert color='success'>
        <AlertTitle>Successful Join</AlertTitle>
        {stringifyHousehold(joinedClients)}{' '}
        {joinedClients.length > 1 ? 'have' : 'has'} been successfully joined to{' '}
        {receivingHohName}’s Enrollment at {projectName}
      </Alert>
      <Button onClick={onClose} variant='contained'>
        Return to {receivingHohName}’s Enrollment
      </Button>
      {remainingHousehold && remainingHouseholdClient && (
        <ButtonLink
          to={generatePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
            clientId: remainingHouseholdClient.client.id,
            enrollmentId: remainingHouseholdClient.enrollment.id,
          })}
          variant='outlined'
        >
          View {remainingName}’s Enrollment
        </ButtonLink>
      )}
      <ButtonLink
        to={generatePath(ProjectDashboardRoutes.PROJECT_ENROLLMENTS, {
          projectId: projectId,
        })}
        variant='outlined'
      >
        View Enrollments at {projectName}
      </ButtonLink>
    </Stack>
  );
};

export default JoinHouseholdSuccess;
