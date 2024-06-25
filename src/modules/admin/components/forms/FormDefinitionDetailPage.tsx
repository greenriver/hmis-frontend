import { Chip, Grid, Stack, Typography } from '@mui/material';

import { generatePath } from 'react-router-dom';
import FormRulesCard from '../formRules/FormRulesCard';
import FormVersionTable from './FormVersionTable';
import ButtonLink from '@/components/elements/ButtonLink';
import { CommonCard } from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';

import useSafeParams from '@/hooks/useSafeParams';
import EditFormButton, {
  FormEditorType,
} from '@/modules/admin/components/forms/EditFormButton';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { AdminDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FormStatus,
  useGetFormIdentifierDetailsQuery,
  FormIdentifierDetailsFragment,
} from '@/types/gqlTypes';

const FormStatusText: React.FC<{
  identifer: FormIdentifierDetailsFragment;
}> = ({ identifer }) => {
  const isPublished = identifer.displayVersion.status === FormStatus.Published;
  const hasDraft = !!identifer.draftVersion;
  const isRetired = identifer.displayVersion.status === FormStatus.Retired;

  if (isPublished && hasDraft) {
    // Form is currently published, but there is also a Draft
    return (
      <Typography color='warning.dark' variant='body2'>
        Published with Unpublished Changes
      </Typography>
    );
  } else if (hasDraft) {
    // Form is not currently published, and there is a Draft
    return (
      <Typography color='error.dark' variant='body2'>
        Not Published
      </Typography>
    );
  } else if (isPublished) {
    // Form is published
    return (
      <Typography color='success.dark' variant='body2'>
        Published
      </Typography>
    );
  } else if (isRetired) {
    // Form is retired
    return <Typography variant='body2'>Retired</Typography>;
  } else {
    return 'Unknown';
  }
};

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

  const isPublished =
    formIdentifier.displayVersion.status === FormStatus.Published;
  const hasDraft = !!formIdentifier.draftVersion;

  return (
    <>
      <PageTitle
        overlineText='Selected Form'
        title={formIdentifier.displayVersion.title}
      />
      <Stack gap={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <CommonCard
              title={
                <Typography variant='h4' component='h2' sx={{ mb: 2 }}>
                  Details
                </Typography>
              }
            >
              <Stack gap={1}>
                <CommonLabeledTextBlock title='Form ID'>
                  {formIdentifier.identifier}
                </CommonLabeledTextBlock>
                <CommonLabeledTextBlock title='Type'>
                  <Chip
                    size='small'
                    sx={{ mt: 0.5 }}
                    label={
                      <HmisEnum
                        enumMap={HmisEnums.FormRole}
                        value={formIdentifier.displayVersion.role}
                      />
                    }
                  />
                </CommonLabeledTextBlock>
                <CommonLabeledTextBlock title='Status'>
                  <FormStatusText identifer={formIdentifier} />
                </CommonLabeledTextBlock>
              </Stack>
            </CommonCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <CommonCard
              title={
                <Typography variant='h4' component='h2' sx={{ mb: 2 }}>
                  Actions
                </Typography>
              }
            >
              <Stack gap={1.5}>
                <RootPermissionsFilter permissions='canManageForms'>
                  <ButtonLink
                    to={generatePath(AdminDashboardRoutes.PREVIEW_FORM_DRAFT, {
                      identifier: formIdentifier.identifier,
                      formId: formIdentifier.draftVersion?.id || '',
                    })}
                    variant='contained'
                    fullWidth
                    disabled={!hasDraft}
                  >
                    Preview / Publish Draft
                  </ButtonLink>
                  <EditFormButton
                    formIdentifier={formIdentifier}
                    text={hasDraft ? 'Edit Draft' : 'New Draft'}
                    editorType={FormEditorType.FormBuilder}
                    variant='outlined'
                  />
                  <EditFormButton
                    formIdentifier={formIdentifier}
                    text={hasDraft ? 'Edit Draft (JSON)' : 'New Draft (JSON)'}
                    editorType={FormEditorType.JsonEditor}
                    variant='outlined'
                  />
                </RootPermissionsFilter>
                <ButtonLink
                  to={generatePath(AdminDashboardRoutes.PREVIEW_FORM, {
                    identifier: formIdentifier.identifier,
                    formId: formIdentifier.displayVersion.id,
                  })}
                  variant='outlined'
                  fullWidth
                  disabled={!isPublished}
                >
                  Preview Published
                </ButtonLink>
              </Stack>
            </CommonCard>
          </Grid>
        </Grid>
        <FormRulesCard
          formId={formIdentifier.displayVersion.id}
          formTitle={formIdentifier.displayVersion.title}
          formRole={formIdentifier.displayVersion.role}
        />
        <TitleCard
          title='Version History'
          headerVariant='border'
          headerTypographyVariant='h4'
          headerComponent='h2'
        >
          <FormVersionTable formIdentifier={formIdentifier.identifier} />
        </TitleCard>
      </Stack>
    </>
  );
};

export default FormDefinitionDetailPage;
