import { Button, IconButton, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { EditIcon } from '@/components/elements/SemanticIcons';
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
    navigate(
      generatePath(AdminDashboardRoutes.VIEW_FORM, {
        identifier: formDefinition.identifier,
      })
    );
  }, [navigate, formDefinition.identifier]);

  return (
    <>
      {renderEditDialog({ title: 'Edit Form Details' })}
      <Stack
        direction='row'
        spacing={2}
        justifyContent='space-between'
        alignItems='end'
      >
        <Typography sx={{ mb: 2 }} variant='h2' component='h1'>
          <Typography variant='overline' color='links' display='block'>
            Editing Draft
          </Typography>
          {formDefinition.title}
          <ButtonTooltipContainer title='Edit Title'>
            <IconButton
              aria-label='edit title'
              onClick={openEditDialog}
              size='small'
              sx={{ color: (theme) => theme.palette.links, ml: 2, mb: 0.5 }}
            >
              <EditIcon fontSize='small' />
            </IconButton>
          </ButtonTooltipContainer>
        </Typography>

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
            onlyIcon
          ></DeleteMutationButton>
        </Stack>
      </Stack>
    </>
  );
};

export default FormBuilderHeader;
