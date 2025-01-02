import { clientBriefName, entryExitRange } from '@/modules/hmis/hmisUtil';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
} from '@/routes/routes';
import { ClientNameFragment, EnrollmentFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export const getViewClientAction = (client: ClientNameFragment) => {
  return {
    title: 'View Client',
    key: 'client',
    ariaLabel: `View Client, ${clientBriefName(client)}`,
    to: generateSafePath(ClientDashboardRoutes.PROFILE, {
      clientId: client.id,
    }),
  };
};

export const getViewEnrollmentAction = (
  enrollment: Pick<EnrollmentFieldsFragment, 'id' | 'entryDate' | 'exitDate'>,
  client: Pick<ClientNameFragment, 'id'> | ClientNameFragment
) => {
  return {
    title: 'View Enrollment',
    key: 'enrollment',
    ariaLabel: `View Enrollment, ${client.hasOwnProperty('firstName') ? clientBriefName(client as ClientNameFragment) : ''} ${entryExitRange(enrollment)}`,
    to: generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
      clientId: client.id,
      enrollmentId: enrollment.id,
    }),
  };
};
