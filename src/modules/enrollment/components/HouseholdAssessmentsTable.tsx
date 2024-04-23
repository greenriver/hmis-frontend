import { useCallback, useMemo } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import {
  ASSESSMENT_COLUMNS,
  generateAssessmentPath,
  getAssessmentTypeFilter,
} from '@/modules/assessments/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import {
  GetHouseholdAssessmentsDocument,
  GetHouseholdAssessmentsQuery,
  GetHouseholdAssessmentsQueryVariables,
} from '@/types/gqlTypes';

export type HhmAssessmentType = NonNullable<
  NonNullable<GetHouseholdAssessmentsQuery['household']>['assessments']
>['nodes'][0];

const columns: ColumnDef<HhmAssessmentType>[] = [
  {
    header: 'Client Name',
    render: (a) => clientBriefName(a.enrollment.client),
  },
  ASSESSMENT_COLUMNS.linkedType,
  ASSESSMENT_COLUMNS.date,
  ASSESSMENT_COLUMNS.lastUpdated,
];

interface Props {
  householdId: string;
  projectId: string;
}

const HouseholdAssessmentsTable: React.FC<Props> = ({
  householdId,
  projectId,
}) => {
  const rowLinkTo = useCallback(
    (assessment: HhmAssessmentType) =>
      generateAssessmentPath(
        assessment,
        assessment.enrollment.client.id,
        assessment.enrollment.id
      ),
    []
  );

  const filter = useMemo(() => getAssessmentTypeFilter(projectId), [projectId]);

  return (
    <GenericTableWithData<
      GetHouseholdAssessmentsQuery,
      GetHouseholdAssessmentsQueryVariables,
      HhmAssessmentType
    >
      showFilters
      queryVariables={{ id: householdId }}
      queryDocument={GetHouseholdAssessmentsDocument}
      rowLinkTo={rowLinkTo}
      columns={columns}
      pagePath='household.assessments'
      noData='No assessments'
      recordType='Assessment'
      headerCellSx={() => ({ color: 'text.secondary' })}
      filters={{ type: filter }}
      filterInputType='AssessmentsForHouseholdFilterOptions'
    />
  );
};

export default HouseholdAssessmentsTable;
