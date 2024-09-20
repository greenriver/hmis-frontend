import GenericTableWithData, {
  Props as GenericTableWithDataProps,
} from '@/modules/dataFetching/components/GenericTableWithData';
import { AssessmentForPopulation } from '@/modules/form/types';
import {
  GetAssessmentsForPopulationDocument,
  GetAssessmentsForPopulationQuery,
  GetAssessmentsForPopulationQueryVariables,
} from '@/types/gqlTypes';

type Props = Omit<
  GenericTableWithDataProps<
    GetAssessmentsForPopulationQuery,
    GetAssessmentsForPopulationQueryVariables,
    AssessmentForPopulation
  >,
  'queryDocument' | 'pagePath'
>;

const AssessmentsForPopulationTable = (props: Props) => {
  return (
    <GenericTableWithData<
      GetAssessmentsForPopulationQuery,
      GetAssessmentsForPopulationQueryVariables,
      AssessmentForPopulation
    >
      queryDocument={GetAssessmentsForPopulationDocument}
      recordType='Assessment'
      pagePath='client.assessments'
      {...props}
    />
  );
};
export default AssessmentsForPopulationTable;
