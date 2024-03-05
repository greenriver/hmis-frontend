import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Paper, Stack, Typography } from '@mui/material';

import { generatePath, useNavigate } from 'react-router-dom';
import FormRuleCard from '../formRules/FormRuleCard';
import ButtonLink from '@/components/elements/ButtonLink';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import { EditIcon } from '@/components/elements/SemanticIcons';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { AdminDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  DeleteFormDefinitionDocument,
  DeleteFormDefinitionMutation,
  DeleteFormDefinitionMutationVariables,
  FormDefinitionInput,
  MutationUpdateFormDefinitionArgs,
  StaticFormRole,
  UpdateFormDefinitionDocument,
  UpdateFormDefinitionMutation,
  useGetFormDefinitionForEditorQuery,
} from '@/types/gqlTypes';
import { evictQuery } from '@/utils/cacheUtil';
const ViewFormDefinitionPage = () => {
  const { formId } = useSafeParams() as { formId: string };
  const navigate = useNavigate();

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
      mutationDocument: UpdateFormDefinitionDocument,
      getErrors: (data) => data.updateFormDefinition?.errors || [],
      getVariables: (values) => ({
        input: values as FormDefinitionInput,
        id: formId,
      }),
      onCompleted: () => {},
      // onClose: () => setSelected(undefined),
    });

  if (error) throw error;
  if (!formDefinition) return <Loading />;

  return (
    <>
      <PageTitle
        title={
          <Stack direction='row' gap={1}>
            <Typography variant='h3'>{formDefinition.title}</Typography>
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
              to={generatePath(AdminDashboardRoutes.EDIT_FORM, { formId })}
              startIcon={<DashboardCustomizeIcon />}
              variant='contained'
            >
              Edit Form
            </ButtonLink>
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
                value={formDefinition.role}
              />
            </CommonLabeledTextBlock>
            <CommonLabeledTextBlock title='Last Updated'>
              Yesterday by XYZ User
            </CommonLabeledTextBlock>
            <CommonLabeledTextBlock title='More stuff'>
              Active in 15 projects [see info]
            </CommonLabeledTextBlock>
          </Stack>
        </Paper>
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

export default ViewFormDefinitionPage;
