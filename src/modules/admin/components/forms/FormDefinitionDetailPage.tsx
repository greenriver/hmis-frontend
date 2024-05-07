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
  useGetFormIdentifierDetailsQuery,
} from '@/types/gqlTypes';

const FormDefinitionDetailPage = () => {
  const { identifier } = useSafeParams() as {
    identifier: string;
  };

  const { data: { formIdentifier } = {}, error } =
    useGetFormIdentifierDetailsQuery({
      variables: { identifier },
    });

  // Dialog for updating form definitions
  const { openFormDialog: openEditDialog, renderFormDialog: renderEditDialog } =
    useStaticFormDialog<
      UpdateFormDefinitionMutation,
      MutationUpdateFormDefinitionArgs
    >({
      formRole: StaticFormRole.FormDefinition,
      initialValues: formIdentifier?.displayVersion || {},
      localConstants: { definitionId: formIdentifier?.displayVersion.id },
      mutationDocument: UpdateFormDefinitionDocument,
      getErrors: (data) => data.updateFormDefinition?.errors || [],
      getVariables: (values) => ({
        input: values as FormDefinitionInput,
        id: formIdentifier?.displayVersion.id || '',
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
          <Typography variant='h3'>
            {formIdentifier.displayVersion.title}
          </Typography>
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
                    value={formIdentifier.displayVersion.role}
                  />
                </CommonLabeledTextBlock>
                <CommonLabeledTextBlock title='Form Identifier'>
                  {formIdentifier.identifier}
                </CommonLabeledTextBlock>
              </Stack>
            </CommonCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <CommonCard title='Form Actions'>
              <Stack direction='row' gap={2}>
                <ButtonLink
                  to={generatePath(AdminDashboardRoutes.EDIT_FORM, {
                    identifier: formIdentifier?.identifier,
                    formId: formIdentifier?.displayVersion.id,
                  })}
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
          formId={formIdentifier.displayVersion.id}
          formTitle={formIdentifier.displayVersion.title}
          formRole={formIdentifier.displayVersion.role}
        />
      </Stack>
      {renderEditDialog({ title: 'Edit Form Details' })}
    </>
  );
};

export default FormDefinitionDetailPage;
