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
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { AdminDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FormDefinitionInput,
  MutationUpdateFormDefinitionArgs,
  StaticFormRole,
  UpdateFormDefinitionDocument,
  UpdateFormDefinitionMutation,
  useGetFormDefinitionForEditorQuery,
} from '@/types/gqlTypes';

const FormDefinitionDetailPage = () => {
  const { formId } = useSafeParams() as { formId: string };

  const { data: { formDefinition } = {}, error } =
    useGetFormDefinitionForEditorQuery({
      variables: { id: formId },
    });

  // Dialog for updating form definitions
  const { openFormDialog: openEditDialog, renderFormDialog: renderEditDialog } =
    useStaticFormDialog<
      UpdateFormDefinitionMutation,
      MutationUpdateFormDefinitionArgs
    >({
      formRole: StaticFormRole.FormDefinition,
      initialValues: formDefinition || {},
      localConstants: { definitionId: formId },
      mutationDocument: UpdateFormDefinitionDocument,
      getErrors: (data) => data.updateFormDefinition?.errors || [],
      getVariables: (values) => ({
        input: values as FormDefinitionInput,
        id: formId,
      }),
    });

  if (error) throw error;
  if (!formDefinition) return <Loading />;

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
          <Typography variant='h3'>{formDefinition.title}</Typography>
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
              <Stack gap={1}>
                <RootPermissionsFilter permissions={'canManageForms'}>
                  <ButtonLink
                    to={generatePath(AdminDashboardRoutes.EDIT_FORM, {
                      formId,
                    })}
                    startIcon={<DashboardCustomizeIcon />}
                    variant='contained'
                    fullWidth
                  >
                    Edit Form
                  </ButtonLink>
                </RootPermissionsFilter>
                <ButtonLink
                  to={generatePath(AdminDashboardRoutes.PREVIEW_FORM, {
                    formId,
                  })}
                  variant='outlined'
                  fullWidth
                >
                  Preview Form
                </ButtonLink>
              </Stack>
            </CommonCard>
          </Grid>
        </Grid>
        <FormRuleCard
          formId={formId}
          formTitle={formDefinition.title}
          formRole={formDefinition.role}
        />
      </Stack>
      {renderEditDialog({ title: 'Edit Form Details' })}
    </>
  );
};

export default FormDefinitionDetailPage;
