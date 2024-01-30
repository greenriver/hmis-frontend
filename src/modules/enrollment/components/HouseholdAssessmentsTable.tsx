import { useCallback } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import { generateAssessmentPath } from '@/modules/assessments/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import AssessmentDateWithStatusIndicator from '@/modules/hmis/components/AssessmentDateWithStatusIndicator';
import {
  clientBriefName,
  formRoleDisplay,
  lastUpdatedBy,
} from '@/modules/hmis/hmisUtil';
import {
  GetHouseholdAssessmentsDocument,
  GetHouseholdAssessmentsQuery,
  GetHouseholdAssessmentsQueryVariables,
} from '@/types/gqlTypes';

type HhmAssessmentType = NonNullable<
  NonNullable<GetHouseholdAssessmentsQuery['household']>['assessments']
>['nodes'][0];

const columns: ColumnDef<HhmAssessmentType>[] = [
  {
    header: 'Client Name',
    render: (a) => clientBriefName(a.enrollment.client),
  },
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
  householdId: string;
}

const HouseholdAssessmentsTable: React.FC<Props> = ({ householdId }) => {
  const rowLinkTo = useCallback(
    (assessment: HhmAssessmentType) =>
      generateAssessmentPath(
        assessment,
        assessment.enrollment.client.id,
        assessment.enrollment.id
      ),
    []
  );

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
      filterInputType='AssessmentsForHouseholdFilterOptions'
    />
  );
};

export default HouseholdAssessmentsTable;
