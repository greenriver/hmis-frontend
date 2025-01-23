import { Paper, Stack, Typography } from '@mui/material';
import { ReactNode, useCallback, useMemo } from 'react';

import NotCollectedText from '@/components/elements/NotCollectedText';
import TableRowActions from '@/components/elements/table/TableRowActions';
import {
  BASE_ACTION_COLUMN_DEF,
  getViewEnrollmentMenuItem,
} from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useClientDashboardContext from '@/modules/client/hooks/useClientDashboardContext';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  entryExitRange,
  parseAndFormatDate,
  PERMANENT_HOUSING_PROJECT_TYPES,
} from '@/modules/hmis/hmisUtil';
import { ENROLLMENT_COLUMNS } from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
import {
  ClientEnrollmentFieldsFragment,
  EnrollmentSortOption,
  GetClientEnrollmentsDocument,
  GetClientEnrollmentsQuery,
  GetClientEnrollmentsQueryVariables,
  ProjectType,
  RelationshipToHoH,
} from '@/types/gqlTypes';

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
    render: 'projectName',
    sticky: 'left',
  },
  organizationName: {
    header: 'Organization Name',
    render: 'organizationName',
  },
  projectType: {
    header: 'Project Type',
    render: ({ projectType }) => (
      <ProjectTypeChip projectType={projectType} sx={{ px: 0.5 }} />
    ),
  },
  enrollmentDetails: {
    header: 'Enrollment Details',
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

const ClientEnrollmentsPage = () => {
  const { client } = useClientDashboardContext();

  const filters = useFilters({
    type: 'EnrollmentsForClientFilterOptions',
  });

  const getPrimaryAction = useCallback(
    (enrollment: ClientEnrollmentFieldsFragment) => {
      return {
        ...getViewEnrollmentMenuItem(enrollment, client),
        // override the default ariaLabel to provide the project name, since we are in the client context
        ariaLabel: `View Enrollment at ${enrollment.projectName} for ${entryExitRange(enrollment)}`,
      };
    },
    [client]
  );

  const columns = useMemo(
    () => [
      CLIENT_ENROLLMENT_COLUMNS.projectName,
      CLIENT_ENROLLMENT_COLUMNS.organizationName,
      ENROLLMENT_COLUMNS.entryDate,
      ENROLLMENT_COLUMNS.exitDate,
      ENROLLMENT_COLUMNS.enrollmentStatus,
      CLIENT_ENROLLMENT_COLUMNS.projectType,
      CLIENT_ENROLLMENT_COLUMNS.enrollmentDetails,
      {
        ...BASE_ACTION_COLUMN_DEF,
        render: (enrollment) => (
          <TableRowActions
            record={enrollment}
            recordName={`${enrollment.projectName} ${entryExitRange(enrollment)}`}
            menuActionConfigs={[getPrimaryAction(enrollment)]}
          />
        ),
      },
    ],
    [getPrimaryAction]
  );

  return (
    <>
      <PageTitle title='Enrollments' />
      <Paper>
        <GenericTableWithData<
          GetClientEnrollmentsQuery,
          GetClientEnrollmentsQueryVariables,
          ClientEnrollmentFieldsFragment
        >
          queryVariables={{ id: client.id }}
          queryDocument={GetClientEnrollmentsDocument}
          columns={columns}
          rowLinkTo={(enrollment) => getPrimaryAction(enrollment).to}
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
