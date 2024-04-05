import { ClientAssessmentType } from '@/components/clientDashboard/enrollments/ClientAssessments';
import { ColumnDef } from '@/components/elements/table/types';
import { HhmAssessmentType } from '@/modules/enrollment/components/HouseholdAssessmentsTable';
import AssessmentDateWithStatusIndicator from '@/modules/hmis/components/AssessmentDateWithStatusIndicator';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import { formRoleDisplay, lastUpdatedBy } from '@/modules/hmis/hmisUtil';
import { ProjectAssessmentType } from '@/modules/projects/components/ProjectAssessments';
import { AssessmentFieldsFragment } from '@/types/gqlTypes';

export const ASSESSMENT_COLUMNS: {
  [key: string]: ColumnDef<
    | ProjectAssessmentType
    | ClientAssessmentType
    | HhmAssessmentType
    | AssessmentFieldsFragment
  >;
} = {
  date: {
    header: 'Assessment Date',
    render: (a) => <AssessmentDateWithStatusIndicator assessment={a} />,
  },
  type: {
    header: 'Assessment Type',
    render: (a) => formRoleDisplay(a),
  },
  linkedType: {
    header: 'Assessment Type',
    render: (a) => formRoleDisplay(a),
    linkTreatment: true,
  },
  lastUpdated: {
    header: 'Last Updated',
    render: (e) => lastUpdatedBy(e.dateUpdated, e.user),
  },
};

export const ASSESSMENT_ENROLLMENT_COLUMNS: {
  [key: string]: ColumnDef<ProjectAssessmentType | ClientAssessmentType>;
} = {
  period: {
    header: 'Enrollment Period',
    render: (a) => <EnrollmentDateRangeWithStatus enrollment={a.enrollment} />,
  },
};
