import { ColumnDef } from '@/components/elements/table/types';
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

export const BASE_ACTION_COLUMN_DEF: ColumnDef<any> = {
  key: 'Actions',
  tableCellProps: { sx: { py: 0 } },
  render: '', // gets overridden when used
  sticky: 'right',
};

export const getViewClientMenuItem = (client: ClientNameFragment) => {
  return {
    title: 'View Client',
    key: 'client',
    ariaLabel: `View Client, ${clientBriefName(client)}`,
    to: generateSafePath(ClientDashboardRoutes.PROFILE, {
      clientId: client.id,
    }),
  };
};

export const getViewEnrollmentMenuItem = (
  enrollment: Pick<EnrollmentFieldsFragment, 'id' | 'entryDate' | 'exitDate'>,
  client: ClientNameFragment
) => {
  return {
    title: 'View Enrollment',
    key: 'enrollment',
    ariaLabel: `View Enrollment, ${clientBriefName(client)} ${entryExitRange(enrollment)}`,
    to: generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
      clientId: client.id,
      enrollmentId: enrollment.id,
    }),
  };
};

export const getViewAssessmentMenuItem = (
  assessment: AssessmentFieldsFragment,
  clientId: string,
  enrollmentId: string,
  individualViewOnly?: boolean
) => {
  return {
    title: 'View Assessment',
    key: 'assessment',
    ariaLabel: `View Assessment, ${assessmentDescription(assessment)}`,
    to: generateAssessmentPath(
      assessment,
      clientId,
      enrollmentId,
      individualViewOnly
    ),
  };
};

export const getViewServiceMenuItem = (
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
