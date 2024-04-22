import { useCallback } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import {
  ASSESSMENT_COLUMNS,
  generateAssessmentPath,
} from '@/modules/assessments/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  AssessmentFieldsFragment,
  GetEnrollmentAssessmentsDocument,
  GetEnrollmentAssessmentsQuery,
  GetEnrollmentAssessmentsQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<AssessmentFieldsFragment>[] = [
  ASSESSMENT_COLUMNS.linkedType,
  ASSESSMENT_COLUMNS.date,
  ASSESSMENT_COLUMNS.lastUpdated,
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
      generateAssessmentPath(assessment, clientId, enrollmentId),
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
