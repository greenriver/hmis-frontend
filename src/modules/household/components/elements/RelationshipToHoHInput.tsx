import { useEffect, useMemo, useState } from 'react';

import RelationshipToHohSelect, {
  Option,
  Props as RelationshipToHohSelectProps,
} from './RelationshipToHohSelect';

import InputIndicatorContainer from '@/components/elements/input/InputIndicatorContainer';
import {
  RelationshipToHoH,
  useUpdateRelationshipToHoHMutation,
} from '@/types/gqlTypes';

interface Props
  extends Omit<RelationshipToHohSelectProps, 'value' | 'onChange'> {
  enrollmentId: string;
  enrollmentLockVersion: number;
  relationshipToHoH: RelationshipToHoH;
}

const RelationshipToHoHInput = ({
  enrollmentId,
  enrollmentLockVersion,
  relationshipToHoH,
  ...props
}: Props) => {
  // Store selected relationship in state so that it can be reflected immediately
  const [relationship, setRelationship] = useState<RelationshipToHoH | null>(
    relationshipToHoH
  );
  const [completed, setCompleted] = useState(false);
  const [updateRelationship, { loading, error: updateError }] =
    useUpdateRelationshipToHoHMutation({
      onCompleted: () => {
        setCompleted(true);
      },
    });

  // If relationshipToHoH prop changes (as it would if setHoH is called), update the relationship in state
  useEffect(() => {
    setRelationship(relationshipToHoH);
  }, [relationshipToHoH]);

  const onChange = useMemo(
    () => (_: any, selected: Option | null) => {
      setCompleted(false);
      setRelationship(selected ? selected.value : null);
      void updateRelationship({
        variables: {
          input: {
            enrollmentId,
            enrollmentLockVersion,
            relationshipToHoH: selected
              ? selected.value
              : RelationshipToHoH.DataNotCollected,
            confirmed: true, // we don't support displaying warnings in this view, so ignore them
          },
        },
      });
    },
    [enrollmentId, enrollmentLockVersion, updateRelationship, setRelationship]
  );

  return (
    <InputIndicatorContainer
      loading={loading}
      error={!!updateError}
      success={completed}
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
