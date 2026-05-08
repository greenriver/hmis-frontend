import { Paper, Stack } from '@mui/material';
import React, { useCallback } from 'react';

import useDebouncedState from '@/hooks/useDebouncedState';
import useTableFilters from '@/hooks/useTableFilters';
import {
  REFERRAL_COLUMNS,
  REFERRAL_WITH_PROJECT_COLUMNS,
} from '@/modules/ce/referralColumns';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';
import {
  ClientDashboardRoutes,
  ReferralRoutes,
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
} from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CeReferralTableFieldsFragment,
  GetCeReferralsDocument,
  GetCeReferralsQuery,
  GetCeReferralsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: DataColumnDef<
  CeReferralTableFieldsFragment,
  GetCeReferralsQueryVariables
>[] = [
  REFERRAL_COLUMNS.client,
  REFERRAL_COLUMNS.status,
  {
    ...REFERRAL_COLUMNS.currentSteps,
    optional: { defaultHidden: false },
  },
  {
    ...REFERRAL_COLUMNS.daysOnCurrentTask,
    optional: { defaultHidden: false },
  },
  {
    ...REFERRAL_COLUMNS.currentTaskSwimlane,
    optional: { defaultHidden: false },
  },
  {
    ...REFERRAL_COLUMNS.currentTaskAssignees,
    optional: { defaultHidden: true },
  },
  REFERRAL_WITH_PROJECT_COLUMNS.projectName,
  {
    ...REFERRAL_WITH_PROJECT_COLUMNS.projectType,
    optional: {
      defaultHidden: true,
    },
  },
  {
    key: 'organization',
    header: 'Organization',
    render: 'targetOrganizationName',
    optional: {
      defaultHidden: true,
    },
  },
  {
    header: 'Unit',
    key: 'unit',
    render: ({ opportunity }) => opportunity?.unit?.name,
    optional: {
      defaultHidden: true,
      queryVariableField: 'includeUnit',
    },
  },
  { ...REFERRAL_COLUMNS.referredBy, optional: { defaultHidden: true } },
  { ...REFERRAL_COLUMNS.date, optional: { defaultHidden: false } },
  {
    key: 'updatedBy',
    header: 'Last Updated By',
    render: ({ updatedBy }) => updatedBy?.name,
    optional: { defaultHidden: false },
  },
  {
    key: 'origin',
    header: 'Origin',
    render: ({ origin }) => HmisEnums.CeReferralOrigin[origin],
    optional: { defaultHidden: false },
  },
];

interface Props {
  projectGroupId?: string;
}

const ReferralsTable: React.FC<Props> = ({ projectGroupId }) => {
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');

  const { filters, filterValues, setFilterValues } = useTableFilters({
    type: 'CeReferralFilterOptions',
    omit: ['projectGroupId'], // only exposed via Workspaces
  });

  const rowSecondaryActions = useCallback(
    (row: CeReferralTableFieldsFragment) => {
      const actions = [];

      if (row.client) {
        // If client is not present, this user doesn't have permission to view
        actions.push({
          key: 'client',
          title: 'View Client Profile',
          to: generateSafePath(ClientDashboardRoutes.PROFILE, {
            clientId: row.clientId,
          }),
        });

        if (row.targetEnrollment) {
          // link to target enrollment if it exists
          actions.push({
            key: 'enrollment',
            title: 'View Enrollment',
            to: generateSafePath(
              EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
              {
                clientId: row.clientId,
                enrollmentId: row.targetEnrollment.id,
              }
            ),
          });
        }
      }

      actions.push({
        key: 'project',
        title: 'View Project',
        to: generateSafePath(ProjectDashboardRoutes.OVERVIEW, {
          projectId: row.targetProjectId,
        }),
      });

      return actions;
    },
    []
  );

  return (
    <Stack gap={2}>
      <CommonSearchInput
        label='Search referrals'
        name='search referrals'
        placeholder='Search by name or referral ID'
        value={search}
        onChange={setSearch}
        fullWidth
        size='medium'
        searchAdornment
      />
      <Paper>
        <GenericTableWithData<
          GetCeReferralsQuery,
          GetCeReferralsQueryVariables,
          CeReferralTableFieldsFragment
        >
          columns={COLUMNS}
          queryVariables={{
            filters: {
              searchTerm: debouncedSearch || undefined,
              projectGroupId,
            },
          }}
          queryDocument={GetCeReferralsDocument}
          pagePath='ceReferrals'
          noData='No referrals'
          paginationItemName='referrals'
          filters={filters}
          filterValues={filterValues}
          onFilterChange={setFilterValues}
          rowLinkTo={(row) =>
            generateSafePath(ReferralRoutes.REFERRAL, {
              referralId: row.id,
            })
          }
          rowActionTitle='View Referral'
          rowSecondaryActionConfigs={rowSecondaryActions}
        />
      </Paper>
    </Stack>
  );
};

export default ReferralsTable;
