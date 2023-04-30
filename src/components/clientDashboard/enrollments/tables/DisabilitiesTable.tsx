import GenericTableWithData, {
  Props as GenericTableWithDataProps,
} from '@/modules/dataFetching/components/GenericTableWithData';
import {
  DisabilityGroupFieldsFragment,
  GetRecentDisabilitiesQuery,
  GetRecentDisabilitiesDocument,
  GetRecentDisabilitiesQueryVariables,
} from '@/types/gqlTypes';

type Props = Omit<
  GenericTableWithDataProps<
    GetRecentDisabilitiesQuery,
    GetRecentDisabilitiesQueryVariables,
    DisabilityGroupFieldsFragment
  >,
  'queryDocument' | 'pagePath'
>;

const DisabilitiesTable = (props: Props) => {
  return (
    <GenericTableWithData<
      GetRecentDisabilitiesQuery,
      GetRecentDisabilitiesQueryVariables,
      DisabilityGroupFieldsFragment
    >
      queryDocument={GetRecentDisabilitiesDocument}
      recordType='DisabilityGroup'
      rowsPath='client.disabilityGroups'
      {...props}
    />
  );
};
export default DisabilitiesTable;
