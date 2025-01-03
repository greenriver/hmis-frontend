import TableRowActions from '@/components/elements/table/TableRowActions';
import {
  BASE_ACTION_COLUMN_DEF,
  getViewAssessmentMenuItem,
} from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import {
  ASSESSMENT_CLIENT_NAME_COL,
  ASSESSMENT_COLUMNS,
} from '@/modules/assessments/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  assessmentDescription,
  clientBriefName,
} from '@/modules/hmis/hmisUtil';
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
  {
    ...BASE_ACTION_COLUMN_DEF,
    render: (assessment: HhmAssessmentType) => (
      <TableRowActions
        record={assessment}
        recordName={assessmentDescription(assessment)}
        primaryActionConfig={{
          ...getViewAssessmentMenuItem(
            assessment,
            assessment.enrollment.client.id,
            assessment.enrollment.id
          ),
          // Since this is for all hh members, overwrite the aria label so it includes the specific client name
          ariaLabel: `View Assessment, ${clientBriefName(assessment.enrollment.client)}'s ${assessmentDescription(assessment)}`,
        }}
      />
    ),
  },
];

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
      pagePath='household.assessments'
      noData='No assessments'
      recordType='Assessment'
      headerCellSx={() => ({ color: 'text.secondary' })}
    />
  );
};

export default HouseholdAssessmentsTable;
