import { Box, Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import EditIconButton from '@/components/elements/EditIconButton';
import PageTitle from '@/components/layout/PageTitle';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';

import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import { cache } from '@/providers/apolloClient';
import { AdminDashboardRoutes } from '@/routes/routes';
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

  const onSuccessfulDelete = useCallback(() => {
    // evict identifier so status updates
    cache.evict({ id: `FormIdentifier:${formDefinition.identifier}` });
    if (formDefinition.isFirstDraft) {
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
  }, [navigate, formDefinition.identifier, formDefinition.isFirstDraft]);

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
              <Box>
                <Typography variant='body1'>
                  Are you sure you want to delete this draft?
                </Typography>
                <Typography variant='body1'>
                  This action cannot be undone.
                </Typography>
                {formDefinition.isFirstDraft && (
                  <Typography variant='body1' sx={{ mt: 2 }}>
                    This form has no previously published versions, so
                    proceeding will delete the form completely.
                  </Typography>
                )}
              </Box>
            }
            onlyIcon
          ></DeleteMutationButton>
        </Stack>
      </Stack>
    </>
  );
};

export default FormBuilderHeader;
