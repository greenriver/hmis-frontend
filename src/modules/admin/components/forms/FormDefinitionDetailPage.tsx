import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import { IconButton, Paper, Stack, Typography } from '@mui/material';

import { generatePath } from 'react-router-dom';
import FormRuleCard from '../formRules/FormRuleCard';
import ButtonLink from '@/components/elements/ButtonLink';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import { EditIcon } from '@/components/elements/SemanticIcons';
import PageTitle from '@/components/layout/PageTitle';
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
      <PageTitle
        title={
          <Stack direction='row' gap={1}>
            <Typography variant='h3'>
              Manage Form: <b>{formIdentifier.title}</b>
            </Typography>
            <IconButton
              aria-label='edit title'
              onClick={openEditDialog}
              size='small'
            >
              <EditIcon fontSize='inherit' />
            </IconButton>
          </Stack>
        }
        actions={
          <Stack direction='row' gap={2}>
            <ButtonLink
              to={generatePath(AdminDashboardRoutes.EDIT_FORM, {
                formIdentifier: identifier,
              })}
              startIcon={<DashboardCustomizeIcon />}
              variant='contained'
            >
              Edit Form
            </ButtonLink>
            {/* Form deletion is not allowed, disabling */}
            {/* <DeleteMutationButton<
              DeleteFormDefinitionMutation,
              DeleteFormDefinitionMutationVariables
            >
              queryDocument={DeleteFormDefinitionDocument}
              variables={{ id: formId }}
              idPath={'deleteFormDefinition.formDefinition.id'}
              recordName='Form Definition'
              ButtonProps={{
                startIcon: <DeleteIcon />,
              }}
              onSuccess={() => {
                evictQuery('formDefinitions');
                navigate(generatePath(AdminDashboardRoutes.FORMS));
              }}
            >
              Delete
            </DeleteMutationButton> */}
          </Stack>
        }
      />

      <Stack gap={2}>
        <Paper sx={{ p: 2 }}>
          <Stack gap={1}>
            <CommonLabeledTextBlock title='Form Type'>
              <HmisEnum
                enumMap={HmisEnums.FormRole}
                value={formIdentifier.role}
              />
            </CommonLabeledTextBlock>
            {/* maybe add more details here, such as recent edit history and project usage */}
          </Stack>
        </Paper>
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
