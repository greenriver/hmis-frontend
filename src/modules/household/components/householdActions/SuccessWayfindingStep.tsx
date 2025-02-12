import { Alert, AlertTitle, Button, Stack } from '@mui/material';
import React from 'react';
import { generatePath } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import {
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
} from '@/routes/routes';
import {
  HouseholdClientFieldsFragment,
  ProjectAllFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  title: string;
  description: string;
  primaryClientName: string;
  secondary?: HouseholdClientFieldsFragment;
  project: Pick<ProjectAllFieldsFragment, 'id' | 'projectName'>;
  onClose: VoidFunction;
}

const SuccessWayfindingStep = ({
  title,
  description,
  primaryClientName,
  secondary,
  project,
  onClose,
}: Props) => {
  const secondaryName = secondary
    ? clientBriefName(secondary.client)
    : undefined;

  return (
    <Stack gap={2}>
      <Alert color='success'>
        <AlertTitle>{title}</AlertTitle>
        {description}
      </Alert>
      <Button onClick={onClose} variant='contained'>
        Return to {primaryClientName}’s Enrollment
      </Button>
      {secondary && (
        <ButtonLink
          to={generatePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
            clientId: secondary.client.id,
            enrollmentId: secondary.enrollment.id,
          })}
          variant='outlined'
        >
          View {secondaryName}’s Enrollment
        </ButtonLink>
      )}
      <ButtonLink
        to={generatePath(ProjectDashboardRoutes.PROJECT_ENROLLMENTS, {
          projectId: project.id,
        })}
        variant='outlined'
      >
        View Enrollments at {project.projectName}
      </ButtonLink>
    </Stack>
  );
};

export default SuccessWayfindingStep;
