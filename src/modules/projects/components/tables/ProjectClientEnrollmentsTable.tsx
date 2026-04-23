import { useMemo } from 'react';
import {
  getViewClientMenuItem,
  getViewEnrollmentMenuItem,
} from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import useTableFilters from '@/hooks/useTableFilters';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { ENROLLMENT_COLUMNS } from '@/modules/enrollment/columns/enrollmentColumns';
import {
  clientBriefName,
  PERMANENT_HOUSING_PROJECT_TYPES,
} from '@/modules/hmis/hmisUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import {
  EnrollmentsForProjectFilterOptions,
  EnrollmentSortOption,
  GetProjectEnrollmentsDocument,
  GetProjectEnrollmentsQuery,
  GetProjectEnrollmentsQueryVariables,
  ProjectEnrollmentQueryEnrollmentFieldsFragment,
} from '@/types/gqlTypes';

export type ProjectEnrollmentFields = NonNullable<
  GetProjectEnrollmentsQuery['project']
>['enrollments']['nodes'][number];

const ProjectClientEnrollmentsTable = ({
  projectId,
  searchTerm,
}: {
  projectId: string;
  searchTerm?: string;
}) => {
  const {
    project: { staffAssignmentsEnabled, projectType },
  } = useProjectDashboardContext();

  const columns: ColumnDef<ProjectEnrollmentQueryEnrollmentFieldsFragment>[] =
    useMemo(() => {
      return [
        { ...CLIENT_COLUMNS.name, sticky: 'left' },
        CLIENT_COLUMNS.age,
        ENROLLMENT_COLUMNS.entryDate,
        ENROLLMENT_COLUMNS.exitDate,
        ENROLLMENT_COLUMNS.enrollmentStatus,
        ...(projectType && PERMANENT_HOUSING_PROJECT_TYPES.includes(projectType)
          ? [ENROLLMENT_COLUMNS.moveInDate]
          : []),
        ENROLLMENT_COLUMNS.lastContactDate,
        ...(staffAssignmentsEnabled ? [ENROLLMENT_COLUMNS.assignedStaff] : []),
      ];
    }, [projectType, staffAssignmentsEnabled]);

  const { filters, filterValues, setFilterValues } = useTableFilters({
    type: 'EnrollmentsForProjectFilterOptions',
    // Always exclude bedNightOnDate filter, it is only applicable to bed night workflow.
    // Exclude assignedStaff filter if staff assignments are not enabled for this project.
    omit: staffAssignmentsEnabled
      ? ['bedNightOnDate']
      : ['bedNightOnDate', 'assignedStaff'],
    pickListArgs: { projectId },
  });

  return (
    <GenericTableWithData<
      GetProjectEnrollmentsQuery,
      GetProjectEnrollmentsQueryVariables,
      ProjectEnrollmentFields,
      EnrollmentsForProjectFilterOptions
    >
      queryVariables={{
        id: projectId,
        filters: { searchTerm },
      }}
      queryDocument={GetProjectEnrollmentsDocument}
      columns={columns}
      rowLinkTo={(row) => getViewEnrollmentMenuItem(row, row.client).to}
      rowActionTitle='View Enrollment'
      rowName={(row) => clientBriefName(row.client)}
      rowSecondaryActionConfigs={(row) => [getViewClientMenuItem(row.client)]}
      noData='No enrollments'
      pagePath='project.enrollments'
      recordType='Enrollment'
      filters={filters}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
      defaultSortOption={EnrollmentSortOption.MostRecent}
    />
  );
};

export default ProjectClientEnrollmentsTable;
