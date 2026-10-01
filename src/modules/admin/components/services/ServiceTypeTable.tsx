import { Chip, Stack } from '@mui/material';
import React from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import useTableFilters from '@/hooks/useTableFilters';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { getServiceTypeForDisplay } from '@/modules/services/serviceColumns';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  GetServiceTypesDocument,
  GetServiceTypesQuery,
  GetServiceTypesQueryVariables,
  ServiceTypeFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: ColumnDef<ServiceTypeFieldsFragment>[] = [
  {
    header: 'Service Name',
    render: 'name',
    key: 'name',
  },
  {
    header: 'Service Category',
    render: ({ serviceCategory }) => serviceCategory.name,
    key: 'category',
  },
  {
    header: 'Tags',
    key: 'tags',
    render: ({ supportsBulkAssignment, hud }) => (
      <Stack direction='row' spacing={1}>
        {supportsBulkAssignment ? (
          <Chip size='small' label='Supports Bulk Assignment' />
        ) : null}
        {hud ? <Chip size='small' label='HUD Service' /> : null}
      </Stack>
    ),
  },
];

interface Props {
  searchTerm?: string;
}

const ServiceTypeTable: React.FC<Props> = ({ searchTerm }) => {
  const { filters, filterValues, setFilterValues } = useTableFilters({
    type: 'ServiceTypeFilterOptions',
  });

  return (
    <>
      <GenericTableWithData<
        GetServiceTypesQuery,
        GetServiceTypesQueryVariables,
        ServiceTypeFieldsFragment
      >
        queryVariables={{ filters: { searchTerm } }}
        queryDocument={GetServiceTypesDocument}
        columns={COLUMNS}
        rowLinkTo={(row) =>
          generateSafePath(AdminDashboardRoutes.CONFIGURE_SERVICE_TYPE, {
            serviceTypeId: row.id,
          })
        }
        rowName={(row) => getServiceTypeForDisplay(row)}
        rowActionTitle='View Service Type'
        pagePath='serviceTypes'
        noData='No service types'
        filters={filters}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        recordType='ServiceType'
        paginationItemName='service type'
      />
    </>
  );
};
export default ServiceTypeTable;
