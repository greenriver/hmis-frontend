import GenericTableWithData, {
  Props as GenericTableWithDataProps,
} from '@/modules/dataFetching/components/GenericTableWithData';
import {
  EnrollmentFieldsFromAssessmentFragment,
  GetRecentEnrollmentsDocument,
  GetRecentEnrollmentsQuery,
  GetRecentEnrollmentsQueryVariables,
} from '@/types/gqlTypes';

type Props = Omit<
  GenericTableWithDataProps<
    GetRecentEnrollmentsQuery,
    GetRecentEnrollmentsQueryVariables,
    EnrollmentFieldsFromAssessmentFragment
  >,
  'queryDocument' | 'pagePath'
>;

const EnrollmentsTable = (props: Props) => {
  return (
    <GenericTableWithData<
      GetRecentEnrollmentsQuery,
      GetRecentEnrollmentsQueryVariables,
      EnrollmentFieldsFromAssessmentFragment
    >
      queryDocument={GetRecentEnrollmentsDocument}
      recordType='Enrollment'
      pagePath='client.enrollments'
      {...props}
    />
  );
};
export default EnrollmentsTable;
