import { Paper, Stack, Typography } from '@mui/material';
import { ReactNode, useCallback } from 'react';

import NotCollectedText from '@/components/elements/NotCollectedText';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import { useFilters } from '@/hooks/useTableFilters';
import useClientDashboardContext from '@/modules/client/hooks/useClientDashboardContext';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { ENROLLMENT_COLUMNS } from '@/modules/enrollment/columns/enrollmentColumns';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import {
  entryExitRange,
  parseAndFormatDate,
  PERMANENT_HOUSING_PROJECT_TYPES,
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

export type ClientEnrollmentTableFields = NonNullable<
  GetClientEnrollmentsQuery['client']
>['enrollments']['nodes'][number];

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

const CLIENT_ENROLLMENT_COLUMNS: {
  [key: string]: ColumnDef<ClientEnrollmentFieldsFragment>;
} = {
  projectName: {
    header: 'Project Name',
    key: 'projectName',
    render: 'projectName',
    sticky: 'left',
  },
  organizationName: {
    header: 'Organization Name',
    key: 'organizationName',
    render: 'organizationName',
  },
  projectType: {
    header: 'Project Type',
    key: 'projectType',
    render: ({ projectType }) => (
      <ProjectTypeChip projectType={projectType} sx={{ px: 0.5 }} />
    ),
  },
  enrollmentDetails: {
    // Enrollment Details shows Move-in Date or Last Bed Night, depending on project type.
    // Ideally this could be now removed in favor of the optional columns Move-in Date and Last Contact Date,
    // but we are avoiding that product churn (which would require additional training) for now
    header: 'Enrollment Details',
    key: 'enrollmentDetails',
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
};

const COLUMNS: ColumnDef<ClientEnrollmentFieldsFragment>[] = [
  CLIENT_ENROLLMENT_COLUMNS.projectName,
  CLIENT_ENROLLMENT_COLUMNS.organizationName,
  ENROLLMENT_COLUMNS.entryDate,
  ENROLLMENT_COLUMNS.exitDate,
  ENROLLMENT_COLUMNS.enrollmentStatus,
  CLIENT_ENROLLMENT_COLUMNS.projectType,
  ENROLLMENT_COLUMNS.moveInDate,
  ENROLLMENT_COLUMNS.lastContactDate,
  ENROLLMENT_COLUMNS.assignedStaff,
  CLIENT_ENROLLMENT_COLUMNS.enrollmentDetails,
];

const ClientEnrollmentsPage = () => {
  const { client } = useClientDashboardContext();

  const filters = useFilters({
    type: 'EnrollmentsForClientFilterOptions',
  });

  const rowLinkTo = useCallback(
    (enrollment: ClientEnrollmentTableFields) => {
      if (!enrollment.access.canViewEnrollmentDetails) return;

      return generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
        clientId: client.id,
        enrollmentId: enrollment.id,
      });
    },
    [client.id]
  );

  return (
    <>
      <PageTitle title='Enrollments' />
      <Paper>
        <GenericTableWithData<
          GetClientEnrollmentsQuery,
          GetClientEnrollmentsQueryVariables,
          ClientEnrollmentTableFields
        >
          queryVariables={{ id: client.id }}
          queryDocument={GetClientEnrollmentsDocument}
          columns={COLUMNS}
          rowLinkTo={rowLinkTo}
          rowName={(row) => ` ${row.projectName} for ${entryExitRange(row)}`}
          rowActionTitle='View Enrollment'
          pagePath='client.enrollments'
          filters={filters}
          recordType='Enrollment'
          noSort
          defaultSortOption={EnrollmentSortOption.MostRecent}
        />
      </Paper>
    </>
  );
};

export default ClientEnrollmentsPage;
