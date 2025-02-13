import { Chip } from '@mui/material';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { getServiceTypeForDisplay } from '@/modules/services/serviceColumns';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  GetServiceTypesDocument,
  GetServiceTypesQuery,
  GetServiceTypesQueryVariables,
  ServiceTypeConfigFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: ColumnDef<ServiceTypeConfigFieldsFragment>[] = [
  {
    header: 'Service Name',
    render: 'name',
  },
  {
    header: 'Service Category',
    render: ({ serviceCategory }) => serviceCategory.name,
  },
  {
    header: 'HUD or Custom',
    render: ({ hud }) => (
      <Chip
        label={hud ? 'HUD' : 'Custom'}
        size='small'
        color={hud ? undefined : 'primary'}
        variant='outlined'
        sx={{ width: 'fit-content' }}
      />
    ),
  },
  {
    header: 'Tags',
    render: ({ supportsBulkAssignment }) =>
      supportsBulkAssignment ? (
        <Chip size='small' label='Supports Bulk Assignment' />
      ) : null,
  },
];

const ServiceTypeTable = () => {
  const filters = useFilters({
    type: 'ServiceTypeFilterOptions',
    omit: ['searchTerm'],
  });

  return (
    <>
      <GenericTableWithData<
        GetServiceTypesQuery,
        GetServiceTypesQueryVariables,
        ServiceTypeConfigFieldsFragment
      >
        queryVariables={{}}
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
        recordType='ServiceType'
        paginationItemName='service type'
      />
    </>
  );
};
export default ServiceTypeTable;
