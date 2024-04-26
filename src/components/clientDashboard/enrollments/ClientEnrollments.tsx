import { Paper, Stack, Typography } from '@mui/material';
import { ReactNode, useCallback } from 'react';

import NotCollectedText from '@/components/elements/NotCollectedText';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  PERMANENT_HOUSING_PROJECT_TYPES,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  ClientEnrollmentFieldsFragment,
  EnrollmentSortOption,
  GetClientEnrollmentsDocument,
  GetClientEnrollmentsQuery,
  GetClientEnrollmentsQueryVariables,
  ProjectType,
  RelationshipToHoH,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const CaptionedText: React.FC<{ caption: string; children: ReactNode }> = ({
  caption,
  children,
}) => {
  return (
    <Stack sx={{ mt: -1, mb: -1 }}>
      <Typography variant='caption' fontWeight={600}>
        {caption}
      </Typography>
      {children}
    </Stack>
  );
};

const columns: ColumnDef<ClientEnrollmentFieldsFragment>[] = [
  {
    header: 'Enrollment Period',
    render: (row) => <EnrollmentDateRangeWithStatus enrollment={row} />,
  },
  {
    header: 'Organization Name',
    render: 'organizationName',
  },
  {
    header: 'Project Name',
    render: 'projectName',
    linkTreatment: true,
    ariaLabel: (row) => row.projectName,
  },

  {
    header: 'Project Type',
    render: ({ projectType }) => (
      <ProjectTypeChip projectType={projectType} sx={{ px: 0.5 }} />
    ),
  },
  {
    header: 'Details',
    render: ({
      moveInDate,
      lastBedNightDate,
      projectType,
      relationshipToHoH,
    }) => {
      if (!projectType) return null;

      const noneText = <NotCollectedText>None</NotCollectedText>;

      // Move-in date for permanent housing projects
      if (
        PERMANENT_HOUSING_PROJECT_TYPES.includes(projectType) &&
        (moveInDate ||
          relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold)
      ) {
        return (
          <CaptionedText caption='Move-in Date'>
            {parseAndFormatDate(moveInDate) || noneText}
          </CaptionedText>
        );
      }

      // Most recent bed-night date for NBN shelters
      if (projectType === ProjectType.EsNbn) {
        return (
          <CaptionedText caption='Last Bed Night Date'>
            {parseAndFormatDate(lastBedNightDate) || noneText}
          </CaptionedText>
        );
      }
    },
  },
];

const ClientEnrollments = () => {
  const { client } = useClientDashboardContext();

  const rowLinkTo = useCallback(
    (enrollment: ClientEnrollmentFieldsFragment) => {
      if (!enrollment.access.canViewEnrollmentDetails) return null;

      return generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
        clientId: client.id,
        enrollmentId: enrollment.id,
      });
    },
    [client]
  );

  const filters = useFilters({
    type: 'EnrollmentsForClientFilterOptions',
  });

  return (
    <>
      <PageTitle
        title='Enrollments'
        // disabled for now #185750557
        // actions={
        //   <RootPermissionsFilter permissions={['canEnrollClients']}>
        //     <ButtonLink
        //       to={generateSafePath(ClientDashboardRoutes.NEW_ENROLLMENT, {
        //         clientId,
        //       })}
        //       Icon={AddIcon}
        //     >
        //       Add Enrollment
        //     </ButtonLink>
        //   </RootPermissionsFilter>
        // }
      />
      <Paper>
        <GenericTableWithData<
          GetClientEnrollmentsQuery,
          GetClientEnrollmentsQueryVariables,
          ClientEnrollmentFieldsFragment
        >
          queryVariables={{ id: client.id }}
          queryDocument={GetClientEnrollmentsDocument}
          rowLinkTo={rowLinkTo}
          columns={columns}
          pagePath='client.enrollments'
          showTopToolbar
          filters={filters}
          recordType='Enrollment'
          noSort
          defaultSortOption={EnrollmentSortOption.MostRecent}
        />
      </Paper>
    </>
  );
};

export default ClientEnrollments;
