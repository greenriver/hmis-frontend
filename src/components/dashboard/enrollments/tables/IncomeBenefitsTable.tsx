import GenericTableWithData, {
  Props as GenericTableWithDataProps,
} from '@/components/elements/GenericTableWithData';
import {
  GetRecentIncomeBenefitsDocument,
  GetRecentIncomeBenefitsQuery,
  GetRecentIncomeBenefitsQueryVariables,
  IncomeBenefitFieldsFragment,
} from '@/types/gqlTypes';

type Props = Omit<
  GenericTableWithDataProps<
    GetRecentIncomeBenefitsQuery,
    GetRecentIncomeBenefitsQueryVariables,
    IncomeBenefitFieldsFragment
  >,
  'queryDocument' | 'pagePath'
>;

const IncomeBenefitsTable = (props: Props) => {
  return (
    <GenericTableWithData<
      GetRecentIncomeBenefitsQuery,
      GetRecentIncomeBenefitsQueryVariables,
      IncomeBenefitFieldsFragment
    >
      queryDocument={GetRecentIncomeBenefitsDocument}
      recordType='IncomeBenefit'
      pagePath='client.incomeBenefits'
      {...props}
    />
  );
};
export default IncomeBenefitsTable;
