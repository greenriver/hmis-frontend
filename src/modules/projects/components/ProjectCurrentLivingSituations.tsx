import { Paper } from '@mui/material';

import { useCallback, useMemo } from 'react';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { baseColumns } from '@/modules/enrollment/components/dashboardPages/EnrollmentCurrentLivingSituationsPage';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  GetProjectCurrentLivingSituationsDocument,
  GetProjectCurrentLivingSituationsQuery,
  GetProjectCurrentLivingSituationsQueryVariables,
  ProjectCurrentLivingSituationFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const ProjectCurrentLivingSituations = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  const columns = useMemo(() => {
    return [
      {
        header: 'First Name',
        linkTreatment: true,
        render: (cls: ProjectCurrentLivingSituationFieldsFragment) => (
          <ClientName client={cls.client} nameParts='first_only' />
        ),
      },
      {
        header: 'Last Name',
        linkTreatment: true,
        render: (cls: ProjectCurrentLivingSituationFieldsFragment) => (
          <ClientName client={cls.client} nameParts='last_only' />
        ),
      },
      { ...baseColumns.informationDate, linkTreatment: false },
      baseColumns.livingSituation,
      baseColumns.locationDetails,
    ];
  }, []);

  const rowLinkTo = useCallback(
    (cls: ProjectCurrentLivingSituationFieldsFragment) => {
      if (!cls) return;

      return generateSafePath(
        EnrollmentDashboardRoutes.CURRENT_LIVING_SITUATIONS,
        {
          clientId: cls.client.id,
          enrollmentId: cls.enrollment.id,
        }
      );
    },
    []
  );

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
          columns={columns}
          pagePath='project.currentLivingSituations'
          noData='No current living situations'
          recordType='CurrentLivingSituation'
          rowLinkTo={rowLinkTo}
        />
      </Paper>
    </>
  );
};
export default ProjectCurrentLivingSituations;
