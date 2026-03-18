import { ColumnDef } from '@/components/elements/table/types';
import useTableFilters from '@/hooks/useTableFilters';
import {
  ASSESSMENT_CLIENT_NAME_COL,
  ASSESSMENT_COLUMNS,
  ASSESSMENT_DETAILS_COL,
  generateAssessmentPath,
} from '@/modules/assessments/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  assessmentDescription,
  clientBriefName,
} from '@/modules/hmis/hmisUtil';
import {
  AssessmentsForHouseholdFilterOptions,
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
  ASSESSMENT_DETAILS_COL,
];

interface Props {
  householdId: string;
  projectId: string;
}

const HouseholdAssessmentsTable: React.FC<Props> = ({
  householdId,
  projectId,
}) => {
  const { filters, filterValues, setFilterValues } =
    useTableFilters<AssessmentsForHouseholdFilterOptions>({
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
      filterValues={filterValues}
      onFilterChange={setFilterValues}
      queryVariables={{ id: householdId }}
      queryDocument={GetHouseholdAssessmentsDocument}
      columns={COLUMNS}
      rowLinkTo={(assessment) =>
        generateAssessmentPath(
          assessment,
          assessment.enrollment.client.id,
          assessment.enrollment.id
        )
      }
      // Since this is for all hh members, includes the specific client name
      rowName={(row) =>
        `${clientBriefName(row.enrollment.client)}'s ${assessmentDescription(row)}`
      }
      rowActionTitle='View Assessment'
      pagePath='household.assessments'
      noData='No assessments'
      recordType='Assessment'
    />
  );
};

export default HouseholdAssessmentsTable;
