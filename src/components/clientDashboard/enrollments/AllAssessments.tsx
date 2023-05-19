import { Paper } from '@mui/material';
import { useCallback } from 'react';

import AssessmentStatus from '@/components/elements/AssessmentStatus';
import { ColumnDef } from '@/components/elements/GenericTable';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  assessmentDescription,
  enrollmentName,
  formRoleDisplay,
  parseAndFormatDate,
  parseAndFormatDateRange,
} from '@/modules/hmis/hmisUtil';
import { ClientDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  AssessmentFilterOptions,
  GetClientAssessmentsDocument,
  GetClientAssessmentsQuery,
  GetClientAssessmentsQueryVariables,
  PickListType,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

type AssessmentType = NonNullable<
  NonNullable<GetClientAssessmentsQuery['client']>['assessments']
>['nodes'][0];

const columns: ColumnDef<AssessmentType>[] = [
  {
    header: 'Status',
    width: '15%',
    render: (a) => <AssessmentStatus assessment={a} />,
  },
  {
    header: 'Type',
    width: '15%',
    render: (assessment) => `${formRoleDisplay(assessment)} Assessment`,
    linkTreatment: true,
    ariaLabel: (row) => assessmentDescription(row),
  },
  {
    header: 'Project',
    render: (row) => enrollmentName(row.enrollment),
  },
  {
    header: 'Date',
    width: '15%',
    render: (e) => parseAndFormatDate(e.assessmentDate),
  },

  {
    header: 'Enrollment Period',
    render: (a) =>
      parseAndFormatDateRange(a.enrollment.entryDate, a.enrollment.exitDate),
  },
];

const AllAssessments = () => {
  const { clientId } = useSafeParams() as { clientId: string };

  const rowLinkTo = useCallback(
    (record: AssessmentType) =>
      generateSafePath(ClientDashboardRoutes.VIEW_ASSESSMENT, {
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
          AssessmentType,
          AssessmentFilterOptions
        >
          queryVariables={{ id: clientId }}
          queryDocument={GetClientAssessmentsDocument}
          rowLinkTo={rowLinkTo}
          columns={columns}
          pagePath='client.assessments'
          fetchPolicy='cache-and-network'
          noData='No assessments.'
          filters={{
            textSearch: {
              type: 'text',
              label: 'Text Search',
            },
            projects: {
              label: 'Projects',
              type: 'picklist',
              pickListReference: PickListType.Project,
            },
            roles: {
              type: 'enum',
              enumType: HmisEnums.FormRole,
              multi: true,
              variant: 'select',
              label: 'Roles',
            },
          }}
        />
      </Paper>
    </>
  );
};

export default AllAssessments;
