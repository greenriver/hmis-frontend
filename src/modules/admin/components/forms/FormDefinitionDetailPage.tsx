import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import { Grid, IconButton, Stack, Typography } from '@mui/material';

import { generatePath } from 'react-router-dom';
import FormRuleCard from '../formRules/FormRuleCard';
import ButtonLink from '@/components/elements/ButtonLink';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { CommonCard } from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import { EditIcon } from '@/components/elements/SemanticIcons';
import useSafeParams from '@/hooks/useSafeParams';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { AdminDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FormDefinitionInput,
  MutationUpdateFormDefinitionArgs,
  StaticFormRole,
  UpdateFormDefinitionDocument,
  UpdateFormDefinitionMutation,
  useGetFormIdentifierForEditorQuery,
} from '@/types/gqlTypes';

const FormDefinitionDetailPage = () => {
  const { formIdentifier: identifier } = useSafeParams() as {
    formIdentifier: string;
  };

  const { data: { formIdentifier } = {}, error } =
    useGetFormIdentifierForEditorQuery({
      variables: { identifier },
    });

  // Dialog for updating form definitions
  const { openFormDialog: openEditDialog, renderFormDialog: renderEditDialog } =
    useStaticFormDialog<
      UpdateFormDefinitionMutation,
      MutationUpdateFormDefinitionArgs
    >({
      formRole: StaticFormRole.FormDefinition,
      initialValues: formIdentifier?.draft || {},
      localConstants: { definitionId: formId },
      mutationDocument: UpdateFormDefinitionDocument,
      getErrors: (data) => data.updateFormDefinition?.errors || [],
      getVariables: (values) => ({
        input: values as FormDefinitionInput,
        id: formIdentifier.currentVersion.id,
      }),
    });

  if (error) throw error;
  if (!formIdentifier) return <Loading />;

  return (
    <>
      <Stack gap={0.5} sx={{ my: 2 }}>
        <Typography
          variant='caption'
          color='links'
          sx={{ textTransform: 'uppercase', fontWeight: 800 }}
        >
          Selected Form
        </Typography>
        <Stack direction='row' gap={1}>
          <Typography variant='h3'>{formIdentifier.title}</Typography>
          <ButtonTooltipContainer title='Edit Title'>
            <IconButton
              aria-label='edit title'
              onClick={openEditDialog}
              size='small'
              sx={{ color: (theme) => theme.palette.links }}
            >
              <EditIcon fontSize='inherit' />
            </IconButton>
          </ButtonTooltipContainer>
        </Stack>
      </Stack>
      <Stack gap={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <CommonCard title='Form Details'>
              <Stack gap={1}>
                <CommonLabeledTextBlock title='Form Type'>
                  <HmisEnum
                    enumMap={HmisEnums.FormRole}
                    value={formDefinition.role}
                  />
                </CommonLabeledTextBlock>
                <CommonLabeledTextBlock title='Form Identifier'>
                  {formDefinition.identifier}
                </CommonLabeledTextBlock>
              </Stack>
            </CommonCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <CommonCard title='Form Actions'>
              <Stack direction='row' gap={2}>
                <ButtonLink
                  to={generatePath(AdminDashboardRoutes.EDIT_FORM, { formId })}
                  startIcon={<DashboardCustomizeIcon />}
                  variant='contained'
                  fullWidth
                >
                  Edit Form
                </ButtonLink>
                {/* TODO add: preview */}
              </Stack>
            </CommonCard>
          </Grid>
        </Grid>
        <FormRuleCard
          formId={formIdentifier.currentVersion.id}
          formTitle={formIdentifier.title}
          formRole={formIdentifier.role}
        />
      </Stack>
      {renderEditDialog({ title: 'Edit Form Details' })}
    </>
  );
};

export default FormDefinitionDetailPage;
