import { format, parseISO } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

import DatePicker from '@/components/elements/input/DatePicker';
import InputIndicatorContainer from '@/components/elements/input/InputIndicatorContainer';
import {
  HouseholdClientFieldsFragment,
  useUpdateEnrollmentMutation,
} from '@/types/gqlTypes';

const EntryDateInput = ({
  enrollment,
}: {
  enrollment: HouseholdClientFieldsFragment['enrollment'];
}) => {
  const [done, setDone] = useState(false);
  const [date, setDate] = useState(
    enrollment.entryDate ? parseISO(enrollment.entryDate) : null
  );
  const [updateEnrollment, { loading, error }] = useUpdateEnrollmentMutation({
    onCompleted: () => setDone(true),
  });

  useEffect(() => {
    // Hide "done" checkmark after a few seconds
    if (!done) return;
    const timer = setTimeout(function () {
      setDone(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [done]);

  const onChange = useMemo(
    () => (value: Date | null) => {
      if (!value) return;
      setDone(false);
      setDate(value);
      void updateEnrollment({
        variables: {
          input: {
            id: enrollment.id,
            entryDate: format(value, 'yyyy-MM-dd'),
          },
        },
      });
    },
    [enrollment, updateEnrollment, setDate]
  );

  return (
    <InputIndicatorContainer loading={loading} error={!!error} success={done}>
      <DatePicker
        value={date}
        disableFuture
        sx={{ width: 150 }}
        onChange={onChange}
      />
    </InputIndicatorContainer>
  );
};
export default EntryDateInput;
