import { useCallback } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import AssessmentDateWithStatusIndicator from '@/modules/hmis/components/AssessmentDateWithStatusIndicator';
import { formRoleDisplay, lastUpdatedBy } from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AssessmentFieldsFragment,
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
    (assessment: AssessmentFieldsFragment) =>
      generateSafePath(EnrollmentDashboardRoutes.VIEW_ASSESSMENT, {
        clientId,
        enrollmentId,
        assessmentId: assessment.id,
      }),
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
