import { Alert, Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { cache } from '@/app/apolloClient';
import { AdminDashboardRoutes } from '@/app/routes';
import ButtonLink from '@/components/elements/ButtonLink';
import EditIconButton from '@/components/elements/EditIconButton';
import PageTitle from '@/components/layout/PageTitle';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';

import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import {
  DeleteFormDefinitionDraftDocument,
  DeleteFormDefinitionDraftMutation,
  DeleteFormDefinitionDraftMutationVariables,
  FormDefinitionFieldsForEditorFragment,
  FormDefinitionInput,
  MutationUpdateFormDefinitionArgs,
  StaticFormRole,
  UpdateFormDefinitionDocument,
  UpdateFormDefinitionMutation,
} from '@/types/gqlTypes';

interface FormEditorHeaderProps {
  formDefinition: FormDefinitionFieldsForEditorFragment;
  onClickPreview: VoidFunction;
}

const FormBuilderHeader: React.FC<FormEditorHeaderProps> = ({
  formDefinition,
  onClickPreview,
}) => {
  const navigate = useNavigate();

  // Dialog for updating form definitions
  const { openFormDialog: openEditDialog, renderFormDialog: renderEditDialog } =
    useStaticFormDialog<
      UpdateFormDefinitionMutation,
      MutationUpdateFormDefinitionArgs
    >({
      formRole: StaticFormRole.FormDefinition,
      initialValues: formDefinition || {},
      localConstants: { definitionId: formDefinition.id },
      mutationDocument: UpdateFormDefinitionDocument,
      getErrors: (data) => data.updateFormDefinition?.errors || [],
      getVariables: (values) => ({
        input: values as FormDefinitionInput,
        id: formDefinition.id || '',
      }),
    });

  const isFirstDraft = formDefinition.version === '0';

  const onSuccessfulDelete = useCallback(() => {
    // evict identifier so status updates
    cache.evict({ id: `FormIdentifier:${formDefinition.identifier}` });
    if (isFirstDraft) {
      // If this is the first draft (aka only version of this identifier),
      // it's been deleted entirely, so navigate back to the forms list
      navigate(generatePath(AdminDashboardRoutes.FORMS));
    } else {
      navigate(
        generatePath(AdminDashboardRoutes.VIEW_FORM, {
          identifier: formDefinition.identifier,
        })
      );
    }
  }, [navigate, formDefinition.identifier, isFirstDraft]);

  return (
    <>
      {renderEditDialog({ title: 'Edit Form Details' })}
      <Stack
        direction='row'
        spacing={2}
        justifyContent='space-between'
        alignItems='end'
      >
        <PageTitle
          title={formDefinition.title}
          overlineText='Editing Draft'
          endElement={
            <EditIconButton
              title='Edit Title'
              onClick={openEditDialog}
              sx={{ ml: 1, mb: 0.5 }}
            />
          }
        />

        <Stack direction='row' spacing={4} alignItems='center'>
          <RootPermissionsFilter permissions='canAdministrateConfig'>
            <ButtonLink
              to={generatePath(AdminDashboardRoutes.JSON_EDIT_FORM, {
                identifier: formDefinition.identifier,
                formId: formDefinition.id,
              })}
              variant='text'
            >
              Edit JSON
            </ButtonLink>
          </RootPermissionsFilter>
          <Button
            variant='text'
            onClick={onClickPreview}
            sx={{ height: 'fit-content' }}
          >
            Preview / Publish
          </Button>
          <DeleteMutationButton<
            DeleteFormDefinitionDraftMutation,
            DeleteFormDefinitionDraftMutationVariables
          >
            queryDocument={DeleteFormDefinitionDraftDocument}
            variables={{ id: formDefinition.id }}
            idPath='deleteFormDefinition.formDefinition.id'
            recordName='draft'
            onSuccess={onSuccessfulDelete}
            confirmationDialogContent={
              <Stack gap={2}>
                <Typography variant='body1'>
                  Are you sure you want to delete this draft?
                  <br />
                  This action cannot be undone.
                </Typography>
                {isFirstDraft && (
                  <Alert severity='error'>
                    Deleting this draft will delete the entire form.
                  </Alert>
                )}
              </Stack>
            }
            onlyIcon
          ></DeleteMutationButton>
        </Stack>
      </Stack>
    </>
  );
};

export default FormBuilderHeader;
