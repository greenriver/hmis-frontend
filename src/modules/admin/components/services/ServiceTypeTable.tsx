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
    header: 'Service Type Name',
    render: 'name',
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
        // showFilters
        recordType='ServiceType'
        paginationItemName='service type'
        defaultPageSize={50} // shouldnt need to paginate
        // condensed
        // noFilter
      />
    </>
  );
};
export default ServiceTypeTable;
