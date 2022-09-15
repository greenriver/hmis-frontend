import { useEffect, useMemo, useState } from 'react';

import RelationshipToHohSelect, { Option } from './RelationshipToHohSelect';

import InputIndicatorContainer from '@/components/elements/input/InputIndicatorContainer';
import {
  RelationshipToHoH,
  useUpdateEnrollmentMutation,
} from '@/types/gqlTypes';

const RelationshipToHoHInput = ({
  enrollmentId,
  relationshipToHoH,
}: {
  enrollmentId: string;
  relationshipToHoH: RelationshipToHoH;
}) => {
  const [done, setDone] = useState(false);
  const [relationship, setRelationship] = useState<RelationshipToHoH | null>(
    relationshipToHoH
  );
  const [updateEnrollment, { loading, error }] = useUpdateEnrollmentMutation({
    onCompleted: () => setDone(true),
  });

  useEffect(() => {
    // Hide "done" checkmark after a few seconds
    if (!done) return;
    const timer = setTimeout(function () {
      setDone(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [done]);

  const onChange = useMemo(
    () => (_: any, selected: Option | null) => {
      setDone(false);
      setRelationship(selected ? selected.value : null);
      void updateEnrollment({
        variables: {
          input: {
            id: enrollmentId,
            relationshipToHoH: selected
              ? selected.value
              : RelationshipToHoH.DataNotCollected,
          },
        },
      });
    },
    [enrollmentId, updateEnrollment, setRelationship]
  );

  return (
    <InputIndicatorContainer loading={loading} error={!!error} success={done}>
      <RelationshipToHohSelect
        value={relationship || null}
        disabled={relationship === RelationshipToHoH.SelfHeadOfHousehold}
        onChange={onChange}
      />
    </InputIndicatorContainer>
  );
};
export default RelationshipToHoHInput;
