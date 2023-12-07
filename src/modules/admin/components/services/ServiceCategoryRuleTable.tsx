import { FORM_RULE_COLUMNS } from '../formRules/FormRuleTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  ActiveStatus,
  FormRuleFieldsFragment,
  GetServiceCategoryRulesDocument,
  GetServiceCategoryRulesQuery,
  GetServiceCategoryRulesQueryVariables,
  SystemStatus,
} from '@/types/gqlTypes';

interface Props {
  serviceCategoryId: string;
}

const ServiceCategoryRuleTable: React.FC<Props> = ({ serviceCategoryId }) => {
  return (
    <>
      <GenericTableWithData<
        GetServiceCategoryRulesQuery,
        GetServiceCategoryRulesQueryVariables,
        FormRuleFieldsFragment
      >
        queryVariables={{ id: serviceCategoryId }}
        queryDocument={GetServiceCategoryRulesDocument}
        // FIXME: needs slightly different columns
        columns={FORM_RULE_COLUMNS}
        pagePath='serviceCategory.formRules'
        noData='No form rules'
        showFilters
        recordType='FormRule'
        filterInputType='FormRuleFilterOptions'
        paginationItemName='rule'
        defaultFilters={{
          activeStatus: ActiveStatus.Active,
          systemForm: SystemStatus.NonSystem,
        }}
      />
    </>
  );
};
export default ServiceCategoryRuleTable;
