import { useMemo } from 'react';

import TableRowActions from '@/components/elements/table/TableRowActions';
import {
  BASE_ACTION_COLUMN_DEF,
  getViewAssessmentAction,
} from '@/components/elements/table/tableRowActionUtil';
import { ASSESSMENT_COLUMNS } from '@/modules/assessments/util';
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

const EnrollmentAssessmentsTable: React.FC<Props> = ({
  clientId,
  enrollmentId,
  projectId,
}) => {
  const columns = useMemo(
    () => [
      ASSESSMENT_COLUMNS.date,
      ASSESSMENT_COLUMNS.type,
      ASSESSMENT_COLUMNS.lastUpdated,
      {
        ...BASE_ACTION_COLUMN_DEF,
        render: (assessment) => (
          <TableRowActions
            record={assessment}
            recordName={assessmentDescription(assessment)}
            primaryActionConfig={getViewAssessmentAction(
              assessment,
              clientId,
              enrollmentId
            )}
          />
        ),
      },
    ],
    [clientId, enrollmentId]
  );

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
      columns={columns}
      pagePath='enrollment.assessments'
      noData='No assessments'
      recordType='Assessment'
      headerCellSx={() => ({ color: 'text.secondary' })}
    />
  );
};

export default EnrollmentAssessmentsTable;
