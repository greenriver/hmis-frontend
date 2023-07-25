import DateRangeIcon from '@mui/icons-material/DateRange';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Stack } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { EnrollmentFieldsFragment, FormRole } from '@/types/gqlTypes';

interface Props {
  icon: 'calendar' | 'pencil';
  enrollment: EnrollmentFieldsFragment;
  formRole: FormRole;
  children?: ReactNode;
  title: string;
}

const EditableOccurrencePointValue = ({
  children,
  icon,
  enrollment,
  formRole,
  title,
}: Props) => {
  const formDialogArgs = useMemo(
    () => ({
      title,
      submitButtonText: 'Save',
      pickListArgs: {
        projectId: enrollment.project.id,
        householdId: enrollment.householdId,
      },
    }),
    [title, enrollment]
  );

  const { openFormDialog, renderFormDialog } = useFormDialog({
    formRole,
    record: enrollment,
    localConstants: {
      entryDate: enrollment.entryDate,
      exitDate: enrollment.exitDate,
    },
  });
  return (
    <Stack direction={'row'} alignItems={'center'} gap={2}>
      <>{children}</>
      <IconButton
        color='primary'
        onClick={openFormDialog}
        sx={{ padding: 0.5 }}
        size='small'
      >
        {icon === 'calendar' ? (
          <DateRangeIcon fontSize='small' />
        ) : (
          <EditIcon fontSize='small' />
        )}
      </IconButton>
      {renderFormDialog(formDialogArgs)}
    </Stack>
  );
};

const PermissionWrappedEditableOccurrencePointValue = (props: Props) => {
  if (!props.enrollment.access.canEditEnrollments) {
    return <>{props.children}</>;
  }
  return <EditableOccurrencePointValue {...props} />;
};

export default PermissionWrappedEditableOccurrencePointValue;
