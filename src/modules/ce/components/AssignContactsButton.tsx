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
  useAssignParticipantsMutation,
} from '@/types/gqlTypes';

interface Props {
  referral: CeReferralFieldsFragment;
}
const AssignContactsButton: React.FC<Props> = ({ referral }: Props) => {
  const [open, setOpen] = useState(false);

  const swimlanes = referral.opportunity.swimlanes || [];

  // Map the existing referral participants to a Record<string, string[]>
  // where key = swimlaneId and value = [userIds]
  const initialValues = useMemo(() => {
    return reduce(
      referral.participants,
      (acc, { swimlane, user }) => ({
        ...acc,
        [swimlane.id]: [...(acc[swimlane.id] || []), user.id],
      }),
      {} as Record<string, string[]>
    );
  }, [referral.participants]);

  // `values` maps swimlaneId to [userIds]
  const [values, setValues] = useState<Record<string, string[]>>(initialValues);

  const handleChangeValue = useCallback(
    (swimlaneId: string, userIds: string[]) => {
      setValues((prevValues: Record<string, string[]>) => ({
        ...prevValues,
        [swimlaneId]: userIds,
      }));
    },
    [setValues]
  );

  const [handleSubmit, { loading, error }] = useAssignParticipantsMutation({
    variables: {
      referralId: referral.id,
      // On submit, map the `values` object into the shape the mutation is expecting: { userId, swimlaneId }
      participants: Object.entries(values).flatMap(([swimlaneId, userIds]) =>
        userIds.map((userId) => ({ userId, swimlaneId }))
      ),
    },
    onCompleted: () => setOpen(false),
  });

  if (error) throw error;

  return (
    <>
      {swimlanes.length === 0 ? (
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
            {swimlanes.map((swimlane) => (
              <AssignContactFormItem
                key={swimlane.id}
                swimlane={swimlane}
                users={values[swimlane.id] || []}
                setUsers={(userIds) => {
                  handleChangeValue(swimlane.id, userIds);
                }}
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
