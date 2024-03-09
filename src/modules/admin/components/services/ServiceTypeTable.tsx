import { Chip } from '@mui/material';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  GetServiceCategoryTypesDocument,
  GetServiceCategoryTypesQuery,
  GetServiceCategoryTypesQueryVariables,
  ServiceTypeFieldsFragment,
} from '@/types/gqlTypes';

export const columns: ColumnDef<ServiceTypeFieldsFragment>[] = [
  {
    header: 'ID',
    render: 'id',
  },
  {
    header: 'Service Type Name',
    render: 'name',
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

interface Props {
  serviceCategoryId: string;
}

const ServiceTypeTable: React.FC<Props> = ({ serviceCategoryId }) => {
  return (
    <>
      <GenericTableWithData<
        GetServiceCategoryTypesQuery,
        GetServiceCategoryTypesQueryVariables,
        ServiceTypeFieldsFragment
      >
        queryVariables={{ id: serviceCategoryId }}
        queryDocument={GetServiceCategoryTypesDocument}
        columns={columns}
        pagePath='serviceCategory.serviceTypes'
        noData='No service types'
        recordType='ServiceType'
        paginationItemName='service type'
        defaultPageSize={50} // shouldnt need to paginate
        showFilters
        // condensed
        // noFilter
      />
    </>
  );
};
export default ServiceTypeTable;
