import { ColumnDef } from '@/components/elements/table/types';
import {
  ASSESSMENT_COLUMNS,
  generateAssessmentPath,
} from '@/modules/assessments/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { assessmentDescription } from '@/modules/hmis/hmisUtil';
import {
  AssessmentFieldsFragment,
  GetEnrollmentAssessmentsDocument,
  GetEnrollmentAssessmentsQuery,
  GetEnrollmentAssessmentsQueryVariables,
} from '@/types/gqlTypes';

interface Props {
  enrollmentId: string;
  clientId: string;
  projectId: string;
}

const COLUMNS: ColumnDef<AssessmentFieldsFragment>[] = [
  { ...ASSESSMENT_COLUMNS.date, sticky: 'left' },
  ASSESSMENT_COLUMNS.type,
  ASSESSMENT_COLUMNS.lastUpdated,
];

const EnrollmentAssessmentsTable: React.FC<Props> = ({
  clientId,
  enrollmentId,
  projectId,
}) => {
  const filters = useFilters({
    type: 'AssessmentsForEnrollmentFilterOptions',
    pickListArgs: { projectId },
  });

  return (
    <GenericTableWithData<
      GetEnrollmentAssessmentsQuery,
      GetEnrollmentAssessmentsQueryVariables,
      AssessmentFieldsFragment
    >
      filters={filters}
      queryVariables={{ id: enrollmentId }}
      queryDocument={GetEnrollmentAssessmentsDocument}
      columns={COLUMNS}
      rowLinkTo={(row) => generateAssessmentPath(row, clientId, enrollmentId)}
      rowName={(row) => assessmentDescription(row)}
      rowActionTitle='View Assessment'
      pagePath='enrollment.assessments'
      noData='No assessments'
      recordType='Assessment'
    />
  );
};

export default EnrollmentAssessmentsTable;
