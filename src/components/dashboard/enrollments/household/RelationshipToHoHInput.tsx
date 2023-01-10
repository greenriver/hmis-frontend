import { useEffect, useMemo, useState } from 'react';

import RelationshipToHohSelect, {
  Option,
  Props as RelationshipToHohSelectProps,
} from './RelationshipToHohSelect';

import InputIndicatorContainer from '@/components/elements/input/InputIndicatorContainer';
import {
  RelationshipToHoH,
  useUpdateEnrollmentMutation,
} from '@/types/gqlTypes';

interface Props
  extends Omit<RelationshipToHohSelectProps, 'value' | 'onChange'> {
  enrollmentId: string;
  relationshipToHoH: RelationshipToHoH;
}

const RelationshipToHoHInput = ({
  enrollmentId,
  relationshipToHoH,
  ...props
}: Props) => {
  // Store selected relationship in state so that it can be reflected immediately
  const [relationship, setRelationship] = useState<RelationshipToHoH | null>(
    relationshipToHoH
  );
  const [done, setDone] = useState(false);
  const [updateEnrollment, { loading, error: updateError }] =
    useUpdateEnrollmentMutation({
      onCompleted: () => {
        setDone(true);
      },
    });

  // If relationshipToHoH prop changes (as it would if setHoH is called), update the relationship in state
  useEffect(() => {
    setRelationship(relationshipToHoH);
  }, [relationshipToHoH]);

  useEffect(() => {
    // Hide "done" checkmark after a few seconds
    if (!done) return;
    const timer = setTimeout(function () {
      setDone(false);
    }, 3000);

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
    <InputIndicatorContainer
      loading={loading}
      error={!!updateError}
      success={done}
    >
      <RelationshipToHohSelect
        value={relationship || null}
        onChange={onChange}
        showDataNotCollected
        {...props}
      />
    </InputIndicatorContainer>
  );
};
export default RelationshipToHoHInput;
