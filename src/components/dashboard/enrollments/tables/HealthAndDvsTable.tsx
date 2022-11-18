import GenericTableWithData, {
  Props as GenericTableWithDataProps,
} from '@/components/elements/GenericTableWithData';
import {
  GetRecentHealthAndDvsDocument,
  GetRecentHealthAndDvsQuery,
  GetRecentHealthAndDvsQueryVariables,
  IncomeBenefitFieldsFragment,
} from '@/types/gqlTypes';

type Props = Omit<
  GenericTableWithDataProps<
    GetRecentHealthAndDvsQuery,
    GetRecentHealthAndDvsQueryVariables,
    IncomeBenefitFieldsFragment
  >,
  'queryDocument' | 'pagePath'
>;

const HealthAndDvsTable = (props: Props) => {
  return (
    <GenericTableWithData<
      GetRecentHealthAndDvsQuery,
      GetRecentHealthAndDvsQueryVariables,
      IncomeBenefitFieldsFragment
    >
      queryDocument={GetRecentHealthAndDvsDocument}
      recordType='HealthAndDv'
      pagePath='client.HealthAndDvs'
      {...props}
    />
  );
};
export default HealthAndDvsTable;
