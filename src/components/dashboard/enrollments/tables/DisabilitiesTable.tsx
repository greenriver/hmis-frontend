import GenericTableWithData, {
  Props as GenericTableWithDataProps,
} from '@/components/elements/GenericTableWithData';
import {
  GetRecentDisabilitiesDocument,
  GetRecentDisabilitiesQuery,
  GetRecentDisabilitiesQueryVariables,
  IncomeBenefitFieldsFragment,
} from '@/types/gqlTypes';

type Props = Omit<
  GenericTableWithDataProps<
    GetRecentDisabilitiesQuery,
    GetRecentDisabilitiesQueryVariables,
    IncomeBenefitFieldsFragment
  >,
  'queryDocument' | 'pagePath'
>;

const DisabilitiesTable = (props: Props) => {
  return (
    <GenericTableWithData<
      GetRecentDisabilitiesQuery,
      GetRecentDisabilitiesQueryVariables,
      IncomeBenefitFieldsFragment
    >
      queryDocument={GetRecentDisabilitiesDocument}
      recordType='IncomeBenefit'
      pagePath='client.Disabilities'
      {...props}
    />
  );
};
export default DisabilitiesTable;
