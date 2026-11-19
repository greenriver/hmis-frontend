import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import CommonDialog from '@/components/elements/CommonDialog';
import TextInput from '@/components/elements/input/TextInput';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import {
  emptyErrorState,
  ErrorState,
  hasErrors,
  partitionValidations,
} from '@/modules/errors/util';
import FormActions, {
  FormActionProps,
} from '@/modules/form/components/FormActions';
import FormSelect from '@/modules/form/components/FormSelect';
import { getRequiredLabel } from '@/modules/form/components/RequiredLabel';
import { FormActionTypes, isPickListOption } from '@/modules/form/types';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  FormDefinitionFieldsForEditorFragment,
  FormRole,
  PickListOption,
  PickListType,
  useCreateFormDefinitionMutation,
  useGetPickListQuery,
  useUpdateFormDefinitionMutation,
  ValidationError,
} from '@/types/gqlTypes';

interface Props {
  // When present, the dialog edits this draft. Otherwise it creates a new form.
  formDefinition?: FormDefinitionFieldsForEditorFragment;
  onClose: VoidFunction;
}

const FormDefinitionDialog: React.FC<Props> = ({ formDefinition, onClose }) => {
  const navigate = useNavigate();
  const isEdit = !!formDefinition;

  const [role, setRole] = useState<PickListOption | null>(null);
  const [title, setTitle] = useState(formDefinition?.title || '');
  const [identifier, setIdentifier] = useState('');
  const [externalFormObjectKey, setExternalFormObjectKey] = useState(
    formDefinition?.externalFormObjectKey || ''
  );
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  const showObjectKey =
    (formDefinition?.role || role?.code) === FormRole.ExternalForm;
  // The key is the form's public URL path, so it's locked once a version has been published.
  // Version 0 is the first draft, so any later version means the form was published.
  const objectKeyLocked =
    !!formDefinition?.externalFormObjectKey && formDefinition.version !== '0';

  const { data: { pickList: roleOptions } = {}, loading: rolesLoading } =
    useGetPickListQuery({
      variables: { pickListType: PickListType.CreatableFormTypes },
      skip: isEdit,
    });

  const onCompleted = (
    errors: ValidationError[] | undefined,
    onSuccess: VoidFunction
  ) =>
    errors && errors.length > 0
      ? setErrorState(partitionValidations(errors))
      : onSuccess();
  const onError = (apolloError: ErrorState['apolloError']) =>
    setErrorState({ ...emptyErrorState, apolloError });

  const [updateFormDefinition, { loading: updateLoading }] =
    useUpdateFormDefinitionMutation({
      onCompleted: (data) =>
        onCompleted(data.updateFormDefinition?.errors, onClose),
      onError,
    });

  const [createFormDefinition, { loading: createLoading }] =
    useCreateFormDefinitionMutation({
      onCompleted: (data) =>
        onCompleted(data.createFormDefinition?.errors, () => {
          const created = data.createFormDefinition?.formDefinition;
          if (created)
            navigate(
              generatePath(AdminDashboardRoutes.VIEW_FORM, {
                identifier: created.identifier,
              })
            );
        }),
      onError,
    });

  const loading = updateLoading || createLoading;
  // Matches the old static form: type, title and identifier are required to create; title is required to edit.
  // The External Form Key is optional until publishing.
  const missingRequired = isEdit
    ? !title.trim()
    : !role || !title.trim() || !identifier.trim();

  const onSubmit = () => {
    if (formDefinition) {
      updateFormDefinition({
        variables: {
          id: formDefinition.id,
          input: {
            title,
            ...(showObjectKey && !objectKeyLocked && { externalFormObjectKey }),
          },
        },
      });
    } else {
      createFormDefinition({
        variables: {
          input: {
            role: role?.code as FormRole | undefined,
            title,
            identifier,
            ...(showObjectKey && { externalFormObjectKey }),
          },
        },
      });
    }
  };

  return (
    <CommonDialog open fullWidth onClose={onClose}>
      <DialogTitle>
        {isEdit ? 'Edit Form Details' : 'New Form Definition'}
      </DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ mt: 2 }}>
          {hasErrors(errorState) && (
            <Stack gap={1}>
              <ApolloErrorAlert error={errorState.apolloError} />
              <ErrorAlert errors={errorState.errors} />
            </Stack>
          )}
          {!isEdit && (
            <FormSelect
              label={getRequiredLabel('Form Type', true)}
              value={role}
              options={roleOptions || []}
              loading={rolesLoading}
              onChange={(_event, option) =>
                setRole(isPickListOption(option) ? option : null)
              }
            />
          )}
          <TextInput
            label={getRequiredLabel('Form Title', true)}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            helperText={
              isEdit ? undefined : 'Human-readable title for the form.'
            }
          />
          {!isEdit && (
            <TextInput
              label={getRequiredLabel('Form Identifier', true)}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              helperText='Unique system identifier for the form. This cannot be changed. It must contain only letters, numbers, underscores, and dashes, and must start with a letter.'
            />
          )}
          {showObjectKey && (
            <TextInput
              label='External Form Key'
              value={externalFormObjectKey}
              onChange={(e) => setExternalFormObjectKey(e.target.value)}
              disabled={objectKeyLocked}
              helperText={
                objectKeyLocked
                  ? 'This form has been published. Contact support to change the key.'
                  : 'Path for the public form. This cannot be changed after the form is published. It must contain only lowercase letters, numbers, underscores, dashes, periods, and slashes.'
              }
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <FormActions
          onSubmit={onSubmit}
          onDiscard={onClose}
          loading={loading}
          config={
            [
              {
                id: 'submit',
                label: isEdit ? 'Save Changes' : 'Create Form',
                action: FormActionTypes.Submit,
                buttonProps: {
                  variant: 'contained',
                  disabled: missingRequired || loading,
                },
              },
              {
                id: 'discard',
                label: 'Discard',
                action: FormActionTypes.Discard,
                buttonProps: { variant: 'gray' },
              },
            ] as FormActionProps['config'] /* 'gray' isn't a typed MUI variant; matches FormActions' default */
          }
        />
      </DialogActions>
    </CommonDialog>
  );
};

export default FormDefinitionDialog;
