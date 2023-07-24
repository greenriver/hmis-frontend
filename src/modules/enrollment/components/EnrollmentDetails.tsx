import { ReactNode, useMemo } from 'react';

import Loading from '@/components/elements/Loading';
import SimpleTable from '@/components/elements/SimpleTable';
import NotCollectedText from '@/modules/form/components/viewable/item/NotCollectedText';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import {
  EnrollmentFieldsFragment,
  useGetEnrollmentDetailsQuery,
} from '@/types/gqlTypes';

const EnrollmentDetails = ({
  enrollment,
}: {
  enrollment: EnrollmentFieldsFragment;
}) => {
  const { data, error } = useGetEnrollmentDetailsQuery({
    variables: { id: enrollment.id },
  });

  const enrollmentWithDetails = useMemo(() => data?.enrollment, [data]);
  if (error) throw error;
  if (!enrollmentWithDetails) return <Loading />;

  const noneText = <NotCollectedText variant='body2'>None</NotCollectedText>;
  const content: Record<string, ReactNode> = {
    'Enrollment Status': <EnrollmentStatus enrollment={enrollment} />,
    'Entry Date': parseAndFormatDate(enrollment.entryDate),
    'Exit Date': parseAndFormatDate(enrollment.exitDate) || noneText,
    'Assigned Unit': enrollment.currentUnit?.name || noneText,
    // 'Move-in Date': parseAndFormatDate(enrollmentWithDetails.moveInDate) || noneText
    // 'Exit Destination': parseAndFormatDate(enrollmentWithDetails.exitDestination) || noneText,
    // 'Date of Engagement': parseAndFormatDate(enrollmentWithDetails.dateOfEngagement) || noneText,
  };

  // FIXME: better formatting (dates) and show the right types even if enrollment/client doesn't have it
  // enrollmentWithDetails.customDataElements.forEach((cde) => {
  //   content[cde.label] = customDataElementValueForKey(
  //     cde.key,
  //     enrollmentWithDetails.customDataElements
  //   );
  // });
  return (
    <SimpleTable
      TableCellProps={{
        sx: {
          py: 2,
          '&:first-of-type': {
            pr: 4,
            width: '1px',
            whiteSpace: 'nowrap',
            verticalAlign: 'baseline',
          },
        },
      }}
      columns={[
        {
          name: 'key',
          render: (row) => (
            <strong style={{ fontWeight: 600 }}>{row.label}</strong>
          ),
        },
        { name: 'value', render: (row) => row.value },
      ]}
      rows={Object.entries(content).map(([id, value], index) => ({
        id: String(index),
        label: id,
        value,
      }))}
    />
  );
};
export default EnrollmentDetails;
