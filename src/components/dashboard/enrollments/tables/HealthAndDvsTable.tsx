import GenericTableWithData, {
  Props as GenericTableWithDataProps,
} from '@/components/elements/GenericTableWithData';
import {
  GetRecentHealthAndDvsDocument,
  GetRecentHealthAndDvsQuery,
  GetRecentHealthAndDvsQueryVariables,
  HealthAndDvFieldsFragment,
} from '@/types/gqlTypes';

type Props = Omit<
  GenericTableWithDataProps<
    GetRecentHealthAndDvsQuery,
    GetRecentHealthAndDvsQueryVariables,
    HealthAndDvFieldsFragment
  >,
  'queryDocument' | 'pagePath'
>;

const HealthAndDvsTable = (props: Props) => {
  return (
    <GenericTableWithData<
      GetRecentHealthAndDvsQuery,
      GetRecentHealthAndDvsQueryVariables,
      HealthAndDvFieldsFragment
    >
      queryDocument={GetRecentHealthAndDvsDocument}
      recordType='HealthAndDv'
      pagePath='client.healthAndDvs'
      {...props}
    />
  );
};
export default HealthAndDvsTable;
