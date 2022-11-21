import GenericTableWithData, {
  Props as GenericTableWithDataProps,
} from '@/components/elements/GenericTableWithData';
import {
  DisabilityFieldsFragment,
  GetRecentDisabilitiesDocument,
  GetRecentDisabilitiesQuery,
  GetRecentDisabilitiesQueryVariables,
} from '@/types/gqlTypes';

type Props = Omit<
  GenericTableWithDataProps<
    GetRecentDisabilitiesQuery,
    GetRecentDisabilitiesQueryVariables,
    DisabilityFieldsFragment
  >,
  'queryDocument' | 'pagePath'
>;

const DisabilitiesTable = (props: Props) => {
  return (
    <GenericTableWithData<
      GetRecentDisabilitiesQuery,
      GetRecentDisabilitiesQueryVariables,
      DisabilityFieldsFragment
    >
      queryDocument={GetRecentDisabilitiesDocument}
      recordType='IncomeBenefit'
      pagePath='client.disabilities'
      {...props}
    />
  );
};
export default DisabilitiesTable;
