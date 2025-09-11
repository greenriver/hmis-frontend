import { Stack, Typography } from '@mui/material';
import { AlwaysPresentLocalConstants } from '../form/util/formUtil';
import { ClientAssessmentType } from './assessmentTypes';
import RelativeDateDisplay from '@/components/elements/RelativeDateDisplay';
import { ColumnDef } from '@/components/elements/table/types';
import { textTruncationSx } from '@/config/theme';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { HhmAssessmentType } from '@/modules/enrollment/components/HouseholdAssessmentsTable';
import AssessmentDateWithStatusIndicator from '@/modules/hmis/components/AssessmentDateWithStatusIndicator';
import {
  clientBriefName,
  customDataElementValueAsString,
  formRoleDisplay,
} from '@/modules/hmis/hmisUtil';
import { ProjectAssessmentType } from '@/modules/projects/components/ProjectAssessments';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AssessmentFieldsFragment,
  AssessmentRole,
  AssessmentWithCdesFragment,
  DisplayHook,
  GetClientAssessmentsQueryVariables,
  GetEnrollmentAssessmentsQueryVariables,
  GetHouseholdAssessmentsQueryVariables,
  GetProjectAssessmentsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export const assessmentPrefix = (role: AssessmentRole) => {
  switch (role) {
    case AssessmentRole.Intake:
      return 'Entry to';
    case AssessmentRole.Exit:
      return 'Exit from';
    case AssessmentRole.Annual:
      return 'Annual for';
    default:
      return 'Assessment for';
  }
};

// Local Constants that can be referenced from HUD or Custom Assessments
export type AssessmentLocalConstants = {
  // Enrollment attributes
  entryDate?: string;
  exitDate?: string;
  projectName?: string;
  // Client attributes from AssessedClientFieldsFragment
  clientName?: string;
  clientDob?: string;
  clientSsn?: string;
  clientAge?: number | null;
  clientRaceEthnicity?: string;
  clientId?: string;
} & typeof AlwaysPresentLocalConstants;

export const generateAssessmentPath = (
  assessment: AssessmentFieldsFragment,
  clientId: string,
  enrollmentId: string,
  individualViewOnly?: boolean
) => {
  // For Intakes/Exits, link to special routes so they can be viewed in hh context (if multi-member household)
  if (assessment.role === AssessmentRole.Intake && !individualViewOnly) {
    return generateSafePath(EnrollmentDashboardRoutes.INTAKE, {
      clientId,
      enrollmentId,
    });
  }
  if (assessment.role === AssessmentRole.Exit && !individualViewOnly) {
    return generateSafePath(EnrollmentDashboardRoutes.EXIT, {
      clientId,
      enrollmentId,
    });
  }

  // Page for viewing individual assessment in Enrollment Dashboards
  return generateSafePath(EnrollmentDashboardRoutes.VIEW_ASSESSMENT, {
    clientId,
    enrollmentId,
    assessmentId: assessment.id,
  });
};

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
    key: 'date',
    render: (a) => <AssessmentDateWithStatusIndicator assessment={a} />,
  },
  type: {
    header: 'Assessment Type',
    key: 'type',
    render: (a) => formRoleDisplay(a),
  },
  lastUpdated: {
    header: 'Last Updated',
    key: 'lastUpdated',
    render: ({ dateUpdated, user }) => {
      if (dateUpdated)
        return (
          <RelativeDateDisplay
            dateString={dateUpdated}
            tooltipSuffixText={user ? `by ${user.name}` : undefined}
          />
        );
    },
  },
};

// Assessment Details column for showing custom data elements in tables
export const ASSESSMENT_DETAILS_COL: DataColumnDef<
  AssessmentWithCdesFragment,
  | GetEnrollmentAssessmentsQueryVariables
  | GetHouseholdAssessmentsQueryVariables
  | GetClientAssessmentsQueryVariables
  | GetProjectAssessmentsQueryVariables
> = {
  header: 'Assessment Details',
  key: 'assessmentDetails',
  render: (assessment) => {
    return (
      <Stack>
        {(assessment.customDataElements || [])
          .filter((cde) => cde.displayHooks.includes(DisplayHook.TableSummary))
          .map((cde) => {
            const val = customDataElementValueAsString(cde);
            return (
              <Typography key={cde.key} variant='body2' sx={textTruncationSx()}>
                {cde.label}: {val}
              </Typography>
            );
          })}
      </Stack>
    );
  },
  optional: {
    defaultHidden: true,
    queryVariableField: 'includeCdes',
  },
};

export const ASSESSMENT_CLIENT_NAME_COL: ColumnDef<
  ProjectAssessmentType | HhmAssessmentType
> = {
  header: 'Client Name',
  key: 'clientName',
  sticky: 'left',
  render: (a) => clientBriefName(a.enrollment.client),
};
