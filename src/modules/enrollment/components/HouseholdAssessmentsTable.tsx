import { getViewAssessmentAction } from '@/components/elements/table/tableActions/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import {
  ASSESSMENT_CLIENT_NAME_COL,
  ASSESSMENT_COLUMNS,
} from '@/modules/assessments/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { assessmentDescription } from '@/modules/hmis/hmisUtil';
import {
  GetHouseholdAssessmentsDocument,
  GetHouseholdAssessmentsQuery,
  GetHouseholdAssessmentsQueryVariables,
} from '@/types/gqlTypes';

export type HhmAssessmentType = NonNullable<
  NonNullable<GetHouseholdAssessmentsQuery['household']>['assessments']
>['nodes'][0];

const COLUMNS: ColumnDef<HhmAssessmentType>[] = [
  ASSESSMENT_CLIENT_NAME_COL,
  ASSESSMENT_COLUMNS.date,
  ASSESSMENT_COLUMNS.type,
  ASSESSMENT_COLUMNS.lastUpdated,
];

const getTableRowActions = (assessment: HhmAssessmentType) => {
  return {
    primaryAction: getViewAssessmentAction(
      assessment,
      assessment.enrollment.client.id,
      assessment.enrollment.id
    ),
  };
};

interface Props {
  householdId: string;
  projectId: string;
}

const HouseholdAssessmentsTable: React.FC<Props> = ({
  householdId,
  projectId,
}) => {
  const filters = useFilters({
    type: 'AssessmentsForHouseholdFilterOptions',
    pickListArgs: { projectId },
  });

  return (
    <GenericTableWithData<
      GetHouseholdAssessmentsQuery,
      GetHouseholdAssessmentsQueryVariables,
      HhmAssessmentType
    >
      filters={filters}
      queryVariables={{ id: householdId }}
      queryDocument={GetHouseholdAssessmentsDocument}
      columns={COLUMNS}
      getTableRowActions={getTableRowActions}
      getRowAccessibleName={(record) => assessmentDescription(record)}
      pagePath='household.assessments'
      noData='No assessments'
      recordType='Assessment'
      headerCellSx={() => ({ color: 'text.secondary' })}
    />
  );
};

export default HouseholdAssessmentsTable;
