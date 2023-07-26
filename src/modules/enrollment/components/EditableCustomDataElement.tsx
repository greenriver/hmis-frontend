import DateRangeIcon from '@mui/icons-material/DateRange';
import EditIcon from '@mui/icons-material/Edit';
import {
  capitalize,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import IconButtonContainer from './IconButtonContainer';
import CommonDialog from '@/components/elements/CommonDialog';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import DynamicForm, {
  DynamicFormOnSubmit,
  DynamicFormRef,
} from '@/modules/form/components/DynamicForm';
import FormDialogActionContent from '@/modules/form/components/FormDialogActionContent';
import {
  customDataElementValue,
  customDataElementValueAsString,
} from '@/modules/hmis/hmisUtil';
import {
  CustomDataElementFieldsFragment,
  CustomDataElementType,
  EnrollmentFieldsFragment,
  ItemType,
  UpdateCustomEnrollmentValueInput,
  useUpdateCustomEnrollmentValueMutation,
} from '@/types/gqlTypes';

const DisplayValue = ({ element, fallback }: Omit<Props, 'enrollment'>) => (
  <>{customDataElementValueAsString(element) || fallback}</>
);
const LINK_ID = 'custom-val';
const itemType = (fieldType: CustomDataElementType) => {
  switch (fieldType) {
    case CustomDataElementType.Date:
      return ItemType.Date;
    case CustomDataElementType.Boolean:
      return ItemType.Boolean;
    case CustomDataElementType.Text:
      return ItemType.Text;
    case CustomDataElementType.Float:
      return ItemType.Currency;
    case CustomDataElementType.Integer:
      return ItemType.Integer;
    default:
      return ItemType.String;
  }
};

interface Props {
  enrollment: EnrollmentFieldsFragment;
  element: CustomDataElementFieldsFragment;
  fallback: ReactNode;
}

const EditableCustomDataElement = ({
  enrollment,
  element,
  fallback,
}: Props) => {
  const localFormDefinition = useMemo(
    () => ({
      item: [
        {
          linkId: LINK_ID,
          type: itemType(element.fieldType),
          text: element.label,
        },
      ],
    }),
    [element]
  );
  const initialValues = useMemo(
    () => ({ [LINK_ID]: customDataElementValue(element.value, 'for_input') }),
    [element]
  );

  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const formRef = useRef<DynamicFormRef>(null);
  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setErrors(emptyErrorState);
  }, []);
  const [mutate, { loading }] = useUpdateCustomEnrollmentValueMutation({
    onCompleted: (data) => {
      if (data.updateCustomEnrollmentValue?.errors?.length) {
        setErrors(
          partitionValidations(data.updateCustomEnrollmentValue?.errors)
        );
      } else {
        closeDialog();
      }
    },
    onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
  });

  const handleSubmit: DynamicFormOnSubmit = useCallback(
    ({ values }) => {
      setErrors(emptyErrorState);
      const input: UpdateCustomEnrollmentValueInput = {
        [`value${capitalize(element.fieldType)}`]: values[LINK_ID],
        customDataElementDefinitionId: element.id,
        enrollmentId: enrollment.id,
      };
      mutate({ variables: { input } });
    },
    [element.fieldType, element.id, enrollment.id, mutate]
  );

  return (
    <>
      <IconButtonContainer
        onClick={() => setDialogOpen(true)}
        Icon={
          element.fieldType === CustomDataElementType.Date
            ? DateRangeIcon
            : EditIcon
        }
      >
        <DisplayValue element={element} fallback={fallback} />
      </IconButtonContainer>
      <CommonDialog open={!!dialogOpen} fullWidth onClose={closeDialog}>
        <DialogTitle>{element.label}</DialogTitle>
        <DialogContent sx={{ my: 2 }}>
          {dialogOpen && (
            <DynamicForm
              ref={formRef}
              definition={localFormDefinition}
              // pickListArgs={pickListArgs}
              initialValues={initialValues}
              FormActionProps={{ onDiscard: closeDialog }}
              onSubmit={handleSubmit}
              loading={loading}
              errors={errors}
              hideSubmit
            />
          )}
        </DialogContent>
        <DialogActions>
          <FormDialogActionContent
            onSubmit={() => formRef.current && formRef.current.SubmitForm()}
            onDiscard={closeDialog}
            discardButtonText='Cancel'
            submitButtonText='Save'
            submitLoading={loading}
          />
        </DialogActions>
      </CommonDialog>
    </>
  );
};

const PermissionWrappedEditableCustomDataElement = (props: Props) => {
  if (!props.enrollment.access.canEditEnrollments) {
    return <DisplayValue element={props.element} fallback={props.fallback} />;
  }
  return <EditableCustomDataElement {...props} />;
};

export default PermissionWrappedEditableCustomDataElement;
