import { Paper } from '@mui/material';
import TableRowActions from '@/components/elements/table/TableRowActions';
import {
  BASE_ACTION_COLUMN_DEF,
  getViewEnrollmentAction,
} from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { CLS_COLUMNS } from '@/modules/enrollment/components/pages/EnrollmentCurrentLivingSituationsPage';
import { clientBriefName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
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
    render: (cls: ProjectCurrentLivingSituationFieldsFragment) => (
      <ClientName client={cls.client} />
    ),
  },
  CLS_COLUMNS.informationDate,
  CLS_COLUMNS.livingSituation,
  WITH_ENROLLMENT_COLUMNS.entryDate,
  WITH_ENROLLMENT_COLUMNS.exitDate,
  {
    ...BASE_ACTION_COLUMN_DEF,
    render: (cls) => (
      <TableRowActions
        record={cls}
        recordName={`${clientBriefName(cls.client)} ${parseAndFormatDate(cls.informationDate) || 'unknown date'}`}
        primaryActionConfig={{
          title: 'View CLS',
          key: 'cls',
          to: generateSafePath(
            EnrollmentDashboardRoutes.CURRENT_LIVING_SITUATIONS,
            {
              clientId: cls.client.id,
              enrollmentId: cls.enrollment.id,
            }
          ),
        }}
        secondaryActionConfigs={[
          getViewEnrollmentAction(cls.enrollment, cls.client),
        ]}
      />
    ),
  },
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
          pagePath='project.currentLivingSituations'
          noData='No current living situations'
          recordType='CurrentLivingSituation'
        />
      </Paper>
    </>
  );
};
export default ProjectCurrentLivingSituations;
