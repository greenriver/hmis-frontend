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

  const { filters, filterValues, setFilterValues } =
    useTableFilters<EnrollmentsForProjectFilterOptions>({
      type: 'EnrollmentsForProjectFilterOptions',
      omit: [
        'bedNightOnDate', // Not applicable, this filter is available via bed night workflow
        staffAssignmentsEnabled ? '' : 'assignedStaff',
      ],
      pickListArgs: { projectId: projectId },
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
