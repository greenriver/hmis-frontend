import VisibilityIcon from '@mui/icons-material/Visibility';
import { Button, Grid, IconButton, Paper, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useMemo } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import { EditIcon } from '@/components/elements/SemanticIcons';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import FormOptionsMenu from '@/modules/formBuilder/components/FormOptionsMenu';
import { HmisEnums } from '@/types/gqlEnums';
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
  const formRole = useMemo(
    () => (formDefinition?.role ? HmisEnums.FormRole[formDefinition.role] : ''),
    [formDefinition]
  );

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
      <Paper sx={{ p: 4 }}>
        <Typography sx={{ mb: 2 }} variant='h2'>
          <Typography variant='overline' color='links' display='block'>
            Editing Form
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
        <Stack direction='row' sx={{ alignItems: 'center' }}>
          <Grid container columnGap={4} rowGap={2}>
            <CommonLabeledTextBlock title='Form Identifier'>
              {formDefinition.identifier}
            </CommonLabeledTextBlock>
            <CommonLabeledTextBlock title='Form Type'>
              {formRole}
            </CommonLabeledTextBlock>
            <CommonLabeledTextBlock title='Status'>
              {formDefinition.status}
            </CommonLabeledTextBlock>
          </Grid>
          <Stack direction='row' spacing={2}>
            <Button
              variant='outlined'
              startIcon={<VisibilityIcon />}
              onClick={onClickPreview}
            >
              Preview
            </Button>
            <FormOptionsMenu />
          </Stack>
        </Stack>
      </Paper>
    </>
  );
};

export default FormBuilderHeader;
