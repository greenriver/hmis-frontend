import { Chip } from '@mui/material';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  GetServiceCategoriesDocument,
  GetServiceCategoriesQuery,
  GetServiceCategoriesQueryVariables,
  ServiceCategoryFieldsFragment,
} from '@/types/gqlTypes';

const columns: ColumnDef<ServiceCategoryFieldsFragment>[] = [
  {
    header: 'Category Name',
    render: 'name',
    linkTreatment: true,
  },
  {
    header: 'Type',
    render: ({ hud }) => (
      <Chip
        label={hud ? 'HUD Services' : 'Custom Services'}
        size='small'
        color={hud ? undefined : 'primary'}
        variant='outlined'
        sx={{ width: 'fit-content' }}
      />
    ),
  },
  {
    header: 'Service Types',
    render: ({ serviceTypes }) =>
      serviceTypes.nodesCount < 3
        ? serviceTypes.nodes.map((t) => t.name).join(', ')
        : `${serviceTypes.nodesCount} service types`,
  },
];

const ServiceCategoryTable = () => {
  // TODO: add mechanism to rename existing service category
  // TODO: add mechanism to delete service category (if empty)
  return (
    <>
      <GenericTableWithData<
        GetServiceCategoriesQuery,
        GetServiceCategoriesQueryVariables,
        ServiceCategoryFieldsFragment
      >
        queryVariables={{}}
        queryDocument={GetServiceCategoriesDocument}
        columns={columns}
        pagePath='serviceCategories'
        noData='No service categories'
        showFilters
        recordType='ServiceCategory'
        paginationItemName='service category'
      />
    </>
  );
};
export default ServiceCategoryTable;
