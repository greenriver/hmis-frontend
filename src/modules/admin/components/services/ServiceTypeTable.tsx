import { Chip } from '@mui/material';
import { omit } from 'lodash-es';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  GetServiceTypesDocument,
  GetServiceTypesQuery,
  GetServiceTypesQueryVariables,
  ServiceTypeConfigFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const columns: ColumnDef<ServiceTypeConfigFieldsFragment>[] = [
  {
    header: 'Service Name',
    render: 'name',
    linkTreatment: true,
  },
  {
    header: 'Service Category',
    render: 'category',
  },
  {
    header: 'Type',
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
    key: 'tags',
    textAlign: 'right',
    render: ({ supportsBulkAssignment }) =>
      supportsBulkAssignment ? (
        <Chip size='small' label='Supports Bulk Assignment' />
      ) : null,
  },
];

const ServiceTypeTable = () => {
  return (
    <>
      <GenericTableWithData<
        GetServiceTypesQuery,
        GetServiceTypesQueryVariables,
        ServiceTypeConfigFieldsFragment
      >
        queryVariables={{}}
        queryDocument={GetServiceTypesDocument}
        columns={columns}
        pagePath='serviceTypes'
        noData='No service types'
        showFilters
        recordType='ServiceType'
        paginationItemName='service type'
        filters={(filters) => omit(filters, 'searchTerm')}
        rowLinkTo={(row) =>
          generateSafePath(AdminDashboardRoutes.CONFIGURE_SERVICE_TYPE, {
            serviceTypeId: row.id,
          })
        }
      />
    </>
  );
};
export default ServiceTypeTable;
