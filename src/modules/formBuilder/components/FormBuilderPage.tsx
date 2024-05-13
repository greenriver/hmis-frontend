import { Button, Paper, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import Loading from '@/components/elements/Loading';
import useSafeParams from '@/hooks/useSafeParams';
import FormBuilderHeader from '@/modules/formBuilder/components/FormBuilderHeader';
import FormItemPalette from '@/modules/formBuilder/components/FormItemPalette';
import FormTree from '@/modules/formBuilder/components/formTree/FormTree';
import { formatDateForDisplay } from '@/modules/hmis/hmisUtil';
import { useGetFormDefinitionFieldsForEditorQuery } from '@/types/gqlTypes';

const FormBuilderPage = () => {
  const { formId } = useSafeParams() as { formId: string };

  const { data: { formDefinition } = {}, error } =
    useGetFormDefinitionFieldsForEditorQuery({
      variables: { id: formId },
    });

  // TODO - update the API to return correct values
  const lastUpdatedDate = formatDateForDisplay(new Date());
  const lastUpdatedBy = 'User Name';

  if (error) throw error;
  if (!formDefinition) return <Loading />;

  return (
    <Box sx={{ display: 'flex' }}>
      <FormItemPalette />
      <Box
        sx={
          // Padding matches the padding usually applied in DashboardContentContainer.
          // (It's moved in here because of the left drawer, above)
          {
            flexGrow: 1,
            pt: 2,
            pb: 8,
            px: { xs: 1, sm: 3, lg: 4 },
          }
        }
      >
        <FormBuilderHeader
          formDefinition={formDefinition}
          lastUpdatedDate={lastUpdatedDate}
        />
        <Box sx={{ p: 4 }}>
          <FormTree definition={formDefinition.definition} />
        </Box>
        <Paper sx={{ p: 4 }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            sx={{ alignItems: 'center' }}
          >
            <Stack direction='row' gap={2}>
              <Button variant='outlined'>Save Draft</Button>
              <Button>Publish</Button>
            </Stack>
            <Typography variant='body2'>
              Last saved on {lastUpdatedDate} by {lastUpdatedBy}
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default FormBuilderPage;
