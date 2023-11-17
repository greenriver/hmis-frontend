import { useCallback } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import AssessmentDateWithStatusIndicator from '@/modules/hmis/components/AssessmentDateWithStatusIndicator';
import {
  clientBriefName,
  formRoleDisplay,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  GetHouseholdAssessmentsDocument,
  GetHouseholdAssessmentsQuery,
  GetHouseholdAssessmentsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

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
    render: (e) =>
      `${
        e.dateUpdated ? parseAndFormatDateTime(e.dateUpdated) : 'Unknown Date'
      } by ${e.user?.name || 'Unknown User'}`,
  },
];

interface Props {
  householdId: string;
}

const HouseholdAssessmentsTable: React.FC<Props> = ({ householdId }) => {
  const rowLinkTo = useCallback(
    (assessment: HhmAssessmentType) =>
      generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
        clientId: assessment.enrollment.client.id,
        enrollmentId: assessment.enrollment.id,
        assessmentId: assessment.id,
        formRole: assessment.role,
      }),
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
