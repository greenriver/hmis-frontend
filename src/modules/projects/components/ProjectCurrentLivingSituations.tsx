import { Paper } from '@mui/material';
import { getViewEnrollmentMenuItem } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/enrollment/columns/enrollmentColumns';
import { CLS_COLUMNS } from '@/modules/enrollment/components/pages/EnrollmentCurrentLivingSituationsPage';
import { clientBriefName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  GetProjectCurrentLivingSituationsDocument,
  GetProjectCurrentLivingSituationsQuery,
  GetProjectCurrentLivingSituationsQueryVariables,
  ProjectCurrentLivingSituationFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: ColumnDef<ProjectCurrentLivingSituationFieldsFragment>[] = [
  {
    header: 'Client Name',
    key: 'clientName',
    sticky: 'left',
    render: (cls: ProjectCurrentLivingSituationFieldsFragment) => (
      <ClientName client={cls.client} />
    ),
  },
  CLS_COLUMNS.informationDate,
  CLS_COLUMNS.livingSituation,
  WITH_ENROLLMENT_COLUMNS.entryDate,
  WITH_ENROLLMENT_COLUMNS.exitDate,
];

const ProjectCurrentLivingSituations = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  return (
    <>
      <PageTitle title='Current Living Situations' />
      <Paper>
        <GenericTableWithData<
          GetProjectCurrentLivingSituationsQuery,
          GetProjectCurrentLivingSituationsQueryVariables,
          ProjectCurrentLivingSituationFieldsFragment
        >
          queryVariables={{ id: projectId }}
          queryDocument={GetProjectCurrentLivingSituationsDocument}
          columns={COLUMNS}
          rowLinkTo={(row) =>
            generateSafePath(
              EnrollmentDashboardRoutes.CURRENT_LIVING_SITUATIONS,
              {
                clientId: row.client.id,
                enrollmentId: row.enrollment.id,
              }
            )
          }
          rowName={(row) =>
            `${clientBriefName(row.client)} ${parseAndFormatDate(row.informationDate) || 'unknown date'}`
          }
          rowActionTitle='View Current Living Situation'
          rowSecondaryActionConfigs={(row) => [
            getViewEnrollmentMenuItem(row.enrollment, row.client),
          ]}
          pagePath='project.currentLivingSituations'
          noData='No current living situations'
          recordType='CurrentLivingSituation'
          paginationItemName='current living situations'
        />
      </Paper>
    </>
  );
};
export default ProjectCurrentLivingSituations;
