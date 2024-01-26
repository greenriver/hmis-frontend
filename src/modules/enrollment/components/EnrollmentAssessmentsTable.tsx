import { useCallback } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import AssessmentDateWithStatusIndicator from '@/modules/hmis/components/AssessmentDateWithStatusIndicator';
import { formRoleDisplay, lastUpdatedBy } from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AssessmentFieldsFragment,
  AssessmentRole,
  GetEnrollmentAssessmentsDocument,
  GetEnrollmentAssessmentsQuery,
  GetEnrollmentAssessmentsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const columns: ColumnDef<AssessmentFieldsFragment>[] = [
  {
    header: 'Assessment Date',
    render: (a) => <AssessmentDateWithStatusIndicator assessment={a} />,
    linkTreatment: true,
  },
  {
    header: 'Assessment Type',
    render: (assessment) => formRoleDisplay(assessment),
  },
  {
    header: 'Last Updated',
    render: (e) => lastUpdatedBy(e.dateUpdated, e.user),
  },
];

interface Props {
  enrollmentId: string;
  clientId: string;
}

const EnrollmentAssessmentsTable: React.FC<Props> = ({
  clientId,
  enrollmentId,
}) => {
  const rowLinkTo = useCallback(
    (assessment: AssessmentFieldsFragment) => {
      // For Intakes/Exits, link to special routes so they can be viewed in hh context (if multi-member household).
      // Not sure if this is desirable, it might be nice to be able to view them individually. But doing this to keep
      // the current behavior, whereby multi-member intakes and exits are ALWAYS viewed in the household view.
      if (assessment.role === AssessmentRole.Intake) {
        return generateSafePath(EnrollmentDashboardRoutes.INTAKE, {
          clientId,
          enrollmentId,
        });
      }
      if (assessment.role === AssessmentRole.Exit) {
        return generateSafePath(EnrollmentDashboardRoutes.EXIT, {
          clientId,
          enrollmentId,
        });
      }
      return generateSafePath(EnrollmentDashboardRoutes.VIEW_ASSESSMENT, {
        clientId,
        enrollmentId,
        assessmentId: assessment.id,
      });
    },
    [clientId, enrollmentId]
  );

  return (
    <GenericTableWithData<
      GetEnrollmentAssessmentsQuery,
      GetEnrollmentAssessmentsQueryVariables,
      AssessmentFieldsFragment
    >
      showFilters
      queryVariables={{ id: enrollmentId }}
      queryDocument={GetEnrollmentAssessmentsDocument}
      rowLinkTo={rowLinkTo}
      columns={columns}
      pagePath='enrollment.assessments'
      noData='No assessments'
      recordType='Assessment'
      headerCellSx={() => ({ color: 'text.secondary' })}
      filterInputType='AssessmentsForEnrollmentFilterOptions'
    />
  );
};

export default EnrollmentAssessmentsTable;
