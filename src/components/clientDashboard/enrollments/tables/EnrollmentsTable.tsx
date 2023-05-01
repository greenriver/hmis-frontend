import GenericTableWithData, {
  Props as GenericTableWithDataProps,
} from '@/modules/dataFetching/components/GenericTableWithData';
import {
  EnrollmentFieldsFromAssessmentFragment,
  GetNonWipEnrollmentsDocument,
  GetNonWipEnrollmentsQuery,
  GetNonWipEnrollmentsQueryVariables,
} from '@/types/gqlTypes';

type Props = Omit<
  GenericTableWithDataProps<
    GetNonWipEnrollmentsQuery,
    GetNonWipEnrollmentsQueryVariables,
    EnrollmentFieldsFromAssessmentFragment
  >,
  'queryDocument' | 'pagePath'
>;

// NOTE: excludes incomplete (WIP) enrollments. only used for record picker dialog.
const EnrollmentsTable = (props: Props) => {
  return (
    <GenericTableWithData<
      GetNonWipEnrollmentsQuery,
      GetNonWipEnrollmentsQueryVariables,
      EnrollmentFieldsFromAssessmentFragment
    >
      queryDocument={GetNonWipEnrollmentsDocument}
      recordType='Enrollment'
      pagePath='client.enrollments'
      {...props}
    />
  );
};
export default EnrollmentsTable;
