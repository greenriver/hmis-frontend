import VisibilityIcon from '@mui/icons-material/Visibility';
import { Button, Grid, IconButton, Paper, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useMemo } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import { EditIcon } from '@/components/elements/SemanticIcons';
import FormOptionsMenu from '@/modules/formBuilder/components/FormOptionsMenu';
import { HmisEnums } from '@/types/gqlEnums';
import { FormDefinitionFieldsForEditorFragment } from '@/types/gqlTypes';

interface FormEditorHeaderProps {
  formDefinition: FormDefinitionFieldsForEditorFragment;
  lastUpdatedDate?: string | null;
  onClickPreview: () => void;
}

const FormBuilderHeader: React.FC<FormEditorHeaderProps> = ({
  formDefinition,
  lastUpdatedDate,
  onClickPreview,
}) => {
  const formRole = useMemo(
    () => (formDefinition?.role ? HmisEnums.FormRole[formDefinition.role] : ''),
    [formDefinition]
  );

  return (
    <Paper sx={{ p: 4 }}>
      <Stack direction='row' gap={1}>
        <Typography sx={{ mb: 2 }} variant='h2'>
          {formDefinition.title}
        </Typography>
        <ButtonTooltipContainer title='Edit Title'>
          <IconButton
            aria-label='edit title'
            onClick={() => {}}
            size='small'
            sx={{ color: (theme) => theme.palette.links, mt: 0.25 }}
          >
            <EditIcon fontSize='inherit' />
          </IconButton>
        </ButtonTooltipContainer>
      </Stack>
      <Stack direction='row' sx={{ alignItems: 'center' }}>
        <Grid container columnGap={4} rowGap={2}>
          <CommonLabeledTextBlock title='Form Identifier'>
            {formDefinition.identifier}
          </CommonLabeledTextBlock>
          <CommonLabeledTextBlock title='Form Type'>
            {formRole}
          </CommonLabeledTextBlock>
          <CommonLabeledTextBlock title='Last Updated'>
            {lastUpdatedDate}
          </CommonLabeledTextBlock>
          <CommonLabeledTextBlock title='Status'>
            {formDefinition.status}
          </CommonLabeledTextBlock>
        </Grid>
        <Stack direction='row' spacing={2}>
          <Button
            variant='outlined'
            startIcon={<VisibilityIcon />}
            onClick={() => onClickPreview()}
          >
            Preview
          </Button>
          <FormOptionsMenu />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default FormBuilderHeader;
