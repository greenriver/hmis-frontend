import React from 'react';
import { generatePath } from 'react-router-dom';
import Wayfinder from '@/components/elements/navigation/Wayfinder';
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
  ProjectAllFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  splitHousehold?: HouseholdFieldsFragment;
  donorHousehold?: HouseholdFieldsFragment;
  initiator: HouseholdClientFieldsFragment;
  project: Pick<ProjectAllFieldsFragment, 'id' | 'projectName'>;
  onClose: VoidFunction;
}

const SplitHouseholdSuccess = ({
  splitHousehold,
  donorHousehold,
  initiator,
  project,
  onClose,
}: Props) => {
  if (!splitHousehold || !donorHousehold) {
    // This is unexpected; if we get here, the split mutation succeeded, but didn't return the expected info.
    // Throw so that we get alerted.
    throw new Error(
      `Something went wrong with splitting ${initiator.id} out of project ${project.id}`
    );
  }

  const donorHoh = findHohOrRep(donorHousehold.householdClients);
  const donorHohName = clientBriefName(donorHoh.client);
  const splitHoh = findHohOrRep(splitHousehold.householdClients);

  return (
    <Wayfinder
      alertTitle='Successful Split'
      alertText={`${stringifyHousehold(splitHousehold.householdClients)} ${splitHousehold.householdClients.length > 1 ? 'have' : 'has'} been successfully split from ${donorHohName}’s Enrollment at ${project.projectName}.`}
      items={[
        {
          title: `Return to ${donorHohName}’s Enrollment`,
          onClick: onClose,
        },
        {
          title: `View ${clientBriefName(splitHoh.client)}'s Enrollment`,
          to: generatePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
            clientId: splitHoh.client.id,
            enrollmentId: splitHoh.enrollment.id,
          }),
        },
        {
          title: `View Enrollments at ${project.projectName}`,
          to: generatePath(ProjectDashboardRoutes.PROJECT_ENROLLMENTS, {
            projectId: project.id,
          }),
        },
      ]}
    />
  );
};

export default SplitHouseholdSuccess;
