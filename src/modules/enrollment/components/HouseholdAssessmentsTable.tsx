import { useCallback } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import {
  ASSESSMENT_COLUMNS,
  generateAssessmentPath,
} from '@/modules/assessments/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
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

  const filters = useFilters({
    type: 'AssessmentsForHouseholdFilterOptions',
    pickListArgs: { projectId: projectId },
  });

  return (
    <GenericTableWithData<
      GetHouseholdAssessmentsQuery,
      GetHouseholdAssessmentsQueryVariables,
      HhmAssessmentType
    >
      showTopToolbar
      filters={filters}
      queryVariables={{ id: householdId }}
      queryDocument={GetHouseholdAssessmentsDocument}
      rowLinkTo={rowLinkTo}
      columns={columns}
      pagePath='household.assessments'
      noData='No assessments'
      recordType='Assessment'
      headerCellSx={() => ({ color: 'text.secondary' })}
    />
  );
};

export default HouseholdAssessmentsTable;
