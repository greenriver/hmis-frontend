import DateRangeIcon from '@mui/icons-material/DateRange';
import EditIcon from '@mui/icons-material/Edit';
import { ReactNode, useMemo } from 'react';
import IconButtonContainer from './IconButtonContainer';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { AlwaysPresentLocalConstants } from '@/modules/form/util/formUtil';
import { EnrollmentFieldsFragment, FormRole } from '@/types/gqlTypes';

interface Props {
  icon: 'calendar' | 'pencil';
  enrollment: EnrollmentFieldsFragment;
  formRole: FormRole;
  children?: ReactNode;
  title: string;
  onCompleted?: VoidFunction;
}

const EditableOccurrencePointValue = ({
  children,
  icon,
  enrollment,
  formRole,
  title,
  onCompleted,
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
      projectType: enrollment.project.projectType,
      ...AlwaysPresentLocalConstants,
    },
    onCompleted,
  });
  return (
    <>
      <IconButtonContainer
        onClick={openFormDialog}
        Icon={icon === 'calendar' ? DateRangeIcon : EditIcon}
      >
        {children}
      </IconButtonContainer>
      {renderFormDialog(formDialogArgs)}
    </>
  );
};

const PermissionWrappedEditableOccurrencePointValue = (props: Props) => {
  if (!props.enrollment.access.canEditEnrollments) {
    return <>{props.children}</>;
  }
  return <EditableOccurrencePointValue {...props} />;
};

export default PermissionWrappedEditableOccurrencePointValue;
