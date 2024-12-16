import { generateAssessmentPath } from '@/modules/assessments/util';
import {
  assessmentDescription,
  clientBriefName,
  entryExitRange,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { ServiceFields } from '@/modules/services/components/ProjectServicesTable';
import { getServiceTypeForDisplay } from '@/modules/services/serviceColumns';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
} from '@/routes/routes';
import {
  AssessmentFieldsFragment,
  ClientNameFragment,
  EnrollmentFieldsFragment,
} from '@/types/gqlTypes';
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

export const getViewAssessmentAction = (
  assessment: AssessmentFieldsFragment,
  clientId: string,
  enrollmentId: string
) => {
  return {
    title: 'View Assessment',
    key: 'assessment',
    ariaLabel: `View Assessment, ${assessmentDescription(assessment)}`,
    to: generateAssessmentPath(assessment, clientId, enrollmentId),
  };
};

export const getViewServiceAction = (
  service: Pick<ServiceFields, 'serviceType' | 'dateProvided'>,
  enrollmentId: string,
  clientId: string
) => {
  return {
    title: 'View Service',
    key: 'service',
    ariaLabel: `View Service, ${getServiceTypeForDisplay(service.serviceType)} on ${parseAndFormatDate(service.dateProvided)}`,
    to: generateSafePath(EnrollmentDashboardRoutes.SERVICES, {
      clientId: clientId,
      enrollmentId: enrollmentId,
    }),
  };
};
