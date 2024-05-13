import VisibilityIcon from '@mui/icons-material/Visibility';
import { Button, Grid, IconButton, Paper, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useMemo } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { EditIcon } from '@/components/elements/SemanticIcons';
import { HmisEnums } from '@/types/gqlEnums';
import { FormDefinitionFieldsForEditorFragment } from '@/types/gqlTypes';
import FormOptionsMenu from '@/modules/formBuilder/components/FormOptionsMenu';

interface FormEditorHeaderProps {
  formDefinition: FormDefinitionFieldsForEditorFragment;
  lastUpdatedDate?: string | null;
}

const FormEditorHeader: React.FC<FormEditorHeaderProps> = ({
  formDefinition,
  lastUpdatedDate,
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
        <Grid container>
          <Grid item xs={3}>
            Form Identifier
          </Grid>
          <Grid item xs={3}>
            Form Title (Role)
          </Grid>
          <Grid item xs={3}>
            Last Updated
          </Grid>
          <Grid item xs={3}>
            Status
          </Grid>
          <Grid item xs={3}>
            {formDefinition.identifier}
          </Grid>
          <Grid item xs={3}>
            {formRole}
          </Grid>
          <Grid item xs={3}>
            {lastUpdatedDate}
          </Grid>
          <Grid item xs={3}>
            {formDefinition.status}
          </Grid>
        </Grid>
        <Stack direction='row' spacing={2}>
          <Button variant='outlined' startIcon={<VisibilityIcon />}>
            Preview
          </Button>
          <FormOptionsMenu />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default FormEditorHeader;
