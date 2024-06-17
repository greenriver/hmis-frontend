import VisibilityIcon from '@mui/icons-material/Visibility';
import { Button, IconButton, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { EditIcon } from '@/components/elements/SemanticIcons';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import {
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

        <Button
          variant='text'
          startIcon={<VisibilityIcon />}
          onClick={onClickPreview}
          sx={{ height: 'fit-content' }}
        >
          Preview / Publish
        </Button>
      </Stack>
    </>
  );
};

export default FormBuilderHeader;
