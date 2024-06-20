import { Button, IconButton } from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';

import EditIconButton from '@/components/elements/EditIconButton';
import { DeleteIcon } from '@/components/elements/SemanticIcons';
import PageTitle from '@/components/layout/PageTitle';
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
          <ButtonTooltipContainer title='Delete Draft'>
            {/* TODO implement delete */}
            <IconButton aria-label='delete draft' size='small'>
              <DeleteIcon />
            </IconButton>
          </ButtonTooltipContainer>
        </Stack>
      </Stack>
    </>
  );
};

export default FormBuilderHeader;
