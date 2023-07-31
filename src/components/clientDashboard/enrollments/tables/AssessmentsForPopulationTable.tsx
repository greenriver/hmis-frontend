import GenericTableWithData, {
  Props as GenericTableWithDataProps,
} from '@/modules/dataFetching/components/GenericTableWithData';
import {
  GetAssessmentsForPopulationDocument,
  GetAssessmentsForPopulationQuery,
  GetAssessmentsForPopulationQueryVariables,
} from '@/types/gqlTypes';

type Fragment = NonNullable<
  GetAssessmentsForPopulationQuery['client']
>['assessments']['nodes'][0];

type Props = Omit<
  GenericTableWithDataProps<
    GetAssessmentsForPopulationQuery,
    GetAssessmentsForPopulationQueryVariables,
    Fragment
  >,
  'queryDocument' | 'pagePath'
>;

const AssessmentsForPopulationTable = (props: Props) => {
  return (
    <GenericTableWithData<
      GetAssessmentsForPopulationQuery,
      GetAssessmentsForPopulationQueryVariables,
      Fragment
    >
      queryDocument={GetAssessmentsForPopulationDocument}
      recordType='Assessment'
      pagePath='client.assessments'
      {...props}
    />
  );
};
export default AssessmentsForPopulationTable;
