import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { reduce } from 'lodash-es';
import React, { useCallback, useMemo, useState } from 'react';
import AssignContactFormItem from './AssignContactFormItem';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import CommonDialog from '@/components/elements/CommonDialog';
import { ContactsIcon } from '@/components/elements/SemanticIcons';
import FormDialogActionContent from '@/modules/form/components/FormDialogActionContent';
import {
  CeReferralFieldsFragment,
  PickListOption,
  useAssignParticipantsMutation,
} from '@/types/gqlTypes';

interface Props {
  referral: CeReferralFieldsFragment;
  projectId: string;
}
const AssignContactsButton: React.FC<Props> = ({
  referral,
  projectId,
}: Props) => {
  const [open, setOpen] = useState(false);

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
    onCompleted: () => setOpen(false),
  });

  if (error) throw error;

  return (
    <>
      {referral.swimlanes.length === 0 ? (
        // If this referral has no swimlanes, disable the button.
        // For now this will only happen if the referral also has no tasks,
        // because the schema requires swimlane to be non-null on tasks.
        <ButtonTooltipContainer
          title={'No swimlanes available'}
          placement='top-start'
        >
          <Button variant='text' startIcon={<ContactsIcon />} disabled={true}>
            Contacts
          </Button>
        </ButtonTooltipContainer>
      ) : (
        <Button
          color='grayscale'
          variant='text'
          startIcon={<ContactsIcon />}
          onClick={() => setOpen(true)}
        >
          Contacts
        </Button>
      )}
      <CommonDialog
        open={open}
        maxWidth='md'
        fullWidth
        onClose={() => setOpen(false)}
      >
        <DialogTitle>Assign Contacts</DialogTitle>
        <DialogContent>
          <Stack gap={2} mt={2}>
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <FormDialogActionContent
            onSubmit={() => handleSubmit()}
            onDiscard={() => setOpen(false)}
            submitLoading={loading}
          />
        </DialogActions>
      </CommonDialog>
    </>
  );
};

export default AssignContactsButton;
