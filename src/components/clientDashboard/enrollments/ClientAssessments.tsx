import { Paper } from '@mui/material';
import { useCallback } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import AssessmentDateWithStatusIndicator from '@/modules/hmis/components/AssessmentDateWithStatusIndicator';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import {
  assessmentDescription,
  formRoleDisplay,
} from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AssessmentSortOption,
  GetClientAssessmentsDocument,
  GetClientAssessmentsQuery,
  GetClientAssessmentsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

type AssessmentType = NonNullable<
  NonNullable<GetClientAssessmentsQuery['client']>['assessments']
>['nodes'][0];

const columns: ColumnDef<AssessmentType>[] = [
  {
    header: 'Assessment Date',
    render: (a) => <AssessmentDateWithStatusIndicator assessment={a} />,
    linkTreatment: true,
    ariaLabel: (row) => assessmentDescription(row),
  },
  {
    header: 'Assessment Type',
    render: (assessment) => formRoleDisplay(assessment),
  },
  {
    header: 'Project Name',
    render: (row) => row.enrollment.projectName,
  },
  {
    header: 'Enrollment Period',
    render: (a) => <EnrollmentDateRangeWithStatus enrollment={a.enrollment} />,
  },
];

const ClientAssessments = () => {
  const { clientId } = useSafeParams() as { clientId: string };

  const rowLinkTo = useCallback(
    (record: AssessmentType) =>
      generateSafePath(EnrollmentDashboardRoutes.VIEW_ASSESSMENT, {
        clientId,
        enrollmentId: record.enrollment.id,
        assessmentId: record.id,
      }),
    [clientId]
  );

  return (
    <>
      <PageTitle title='Assessments' />
      <Paper>
        <GenericTableWithData<
          GetClientAssessmentsQuery,
          GetClientAssessmentsQueryVariables,
          AssessmentType
        >
          showFilters
          queryVariables={{ id: clientId }}
          queryDocument={GetClientAssessmentsDocument}
          rowLinkTo={rowLinkTo}
          columns={columns}
          pagePath='client.assessments'
          fetchPolicy='cache-and-network'
          noData='No assessments'
          recordType='Assessment'
          defaultSortOption={AssessmentSortOption.AssessmentDate}
        />
      </Paper>
    </>
  );
};

export default ClientAssessments;
