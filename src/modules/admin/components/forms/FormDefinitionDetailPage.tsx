import CodeIcon from '@mui/icons-material/Code';
import { Grid, Stack, Typography } from '@mui/material';

import { generatePath } from 'react-router-dom';
import FormRuleCard from '../formRules/FormRuleCard';
import ButtonLink from '@/components/elements/ButtonLink';
import { CommonCard } from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import useSafeParams from '@/hooks/useSafeParams';
import EditFormButton, {
  FormEditorType,
} from '@/modules/admin/components/forms/EditFormButton';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { AdminDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import { useGetFormIdentifierDetailsQuery } from '@/types/gqlTypes';

const FormDefinitionDetailPage = () => {
  const { identifier } = useSafeParams() as {
    identifier: string;
  };

  const { data: { formIdentifier } = {}, error } =
    useGetFormIdentifierDetailsQuery({
      variables: { identifier },
    });

  if (error) throw error;
  if (!formIdentifier) return <Loading />;

  return (
    <>
      <Stack gap={2}>
        <Typography variant='h3' component='h1'>
          <Typography variant='overline' color='links' display='block'>
            Selected Form
          </Typography>
          {formIdentifier.displayVersion.title}
        </Typography>
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
              <Stack gap={1}>
                <RootPermissionsFilter permissions={'canManageForms'}>
                  <EditFormButton
                    formIdentifier={formIdentifier}
                    text={
                      formIdentifier.draftVersion ? 'Edit Draft' : 'Edit Form'
                    }
                  />
                  <EditFormButton
                    formIdentifier={formIdentifier}
                    text='JSON Editor'
                    Icon={CodeIcon}
                    editorRoute={FormEditorType.JsonEditor}
                  />
                </RootPermissionsFilter>
                <ButtonLink
                  to={generatePath(AdminDashboardRoutes.PREVIEW_FORM, {
                    identifier: formIdentifier?.identifier,
                    formId: formIdentifier?.displayVersion.id,
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
          formId={formIdentifier.displayVersion.id}
          formTitle={formIdentifier.displayVersion.title}
          formRole={formIdentifier.displayVersion.role}
        />
      </Stack>
    </>
  );
};

export default FormDefinitionDetailPage;
