import { Paper, Stack } from '@mui/material';
import { reduce } from 'lodash-es';
import React, { useCallback, useMemo, useState } from 'react';
import AssignContactFormItem from './AssignContactFormItem';
import LoadingButton from '@/components/elements/LoadingButton';
import {
  CeReferralFieldsFragment,
  PickListOption,
  useAssignParticipantsMutation,
} from '@/types/gqlTypes';

interface Props {
  referral: CeReferralFieldsFragment;
  projectId: string;
  onClose?: VoidFunction;
}
const AssignContactsForm: React.FC<Props> = ({
  referral,
  projectId,
  onClose,
}: Props) => {
  const initialValues = useMemo(() => {
    return reduce(
      referral.swimlanes,
      (acc, swimlane) => {
        acc[swimlane.id] = swimlane.participants.map((user) => {
          return {
            code: user.id,
            label: user.name,
          };
        });
        return acc;
      },
      {} as Record<string, PickListOption[]>
    );
  }, [referral.swimlanes]);

  // `values` maps swimlaneId to PickListOption[]
  // where PickListOption looks like: { code: <user ID>, label: <user name> }
  const [values, setValues] =
    useState<Record<string, PickListOption[]>>(initialValues);

  const handleChangeValue = useCallback(
    (swimlaneId: string, users: PickListOption[]) => {
      setValues((prevValues: Record<string, PickListOption[]>) => ({
        ...prevValues,
        [swimlaneId]: users,
      }));
    },
    [setValues]
  );

  const [handleSubmit, { loading, error }] = useAssignParticipantsMutation({
    variables: {
      referralId: referral.id,
      // On submit, map the `values` object into the shape the mutation is expecting: [{ userId, swimlaneId }]
      participants: Object.entries(values).flatMap(([swimlaneId, userIds]) =>
        userIds.map(({ code }) => ({ userId: code, swimlaneId }))
      ),
    },
    onCompleted: () => onClose?.(),
  });

  if (error) throw error;

  return (
    <Stack p={2} sx={{ backgroundColor: 'background.default', mb: 6 }}>
      <Paper sx={{ p: 2 }}>
        <Stack gap={2}>
          {referral.swimlanes?.map((swimlane) => (
            <AssignContactFormItem
              key={swimlane.id}
              swimlane={swimlane}
              users={values[swimlane.id] || []}
              setUsers={(userIds) => {
                handleChangeValue(swimlane.id, userIds);
              }}
              projectId={projectId}
            />
          ))}
          <LoadingButton onClick={() => handleSubmit()} loading={loading}>
            Submit
          </LoadingButton>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default AssignContactsForm;
