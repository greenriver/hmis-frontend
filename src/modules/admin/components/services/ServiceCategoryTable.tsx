import { Chip } from '@mui/material';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  GetServiceCategoriesDocument,
  GetServiceCategoriesQuery,
  GetServiceCategoriesQueryVariables,
  ServiceCategoryFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

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

const FormRuleTable = () => {
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
        rowLinkTo={(row) =>
          generateSafePath(AdminDashboardRoutes.CONFIGURE_SERVICE_CATEGORY, {
            serviceCategoryId: row.id,
          })
        }
      />
    </>
  );
};
export default FormRuleTable;
