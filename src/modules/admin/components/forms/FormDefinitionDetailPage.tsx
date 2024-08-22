import { Chip, Divider, Grid, Stack, Typography } from '@mui/material';

import React from 'react';
import { generatePath } from 'react-router-dom';
import FormRulesCard from '../formRules/FormRulesCard';
import FormVersionTable from './FormVersionTable';
import ButtonLink from '@/components/elements/ButtonLink';
import { CommonCard } from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';

import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import EditFormButton from '@/modules/admin/components/forms/EditFormButton';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { AdminDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FormIdentifierDetailsFragment,
  FormStatus,
  useGetFormIdentifierDetailsQuery,
} from '@/types/gqlTypes';

const FormStatusText: React.FC<{
  identifier: FormIdentifierDetailsFragment;
}> = ({ identifier }) => {
  console.log(identifier);
  const isPublished = identifier.displayVersion.status === FormStatus.Published;
  const hasDraft = !!identifier.draftVersion;
  const isRetired = identifier.displayVersion.status === FormStatus.Retired;

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

  const {
    data: { formIdentifier } = {},
    error,
    loading,
  } = useGetFormIdentifierDetailsQuery({
    variables: { identifier },
  });

  if (error) throw error;
  if (!formIdentifier && loading) return <Loading />;
  if (!formIdentifier) return <NotFound />;

  const isPublished =
    formIdentifier.displayVersion.status === FormStatus.Published;
  const publishedBy = isPublished
    ? formIdentifier.displayVersion.updatedBy
    : undefined;
  const publishedOn = isPublished
    ? formIdentifier.displayVersion.dateUpdated
    : undefined;

  const hasDraft = !!formIdentifier.draftVersion;
  const draftUpdatedBy = hasDraft
    ? formIdentifier.draftVersion?.updatedBy
    : undefined;
  const draftUpdatedOn = hasDraft
    ? formIdentifier.draftVersion?.dateUpdated
    : undefined;

  return (
    <>
      <PageTitle
        overlineText='Selected Form'
        title={formIdentifier.displayVersion.title}
      />
      <Stack gap={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <CommonCard title='Details' titleComponent='h5'>
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
                  <FormStatusText identifier={formIdentifier} />
                </CommonLabeledTextBlock>
              </Stack>
            </CommonCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <CommonCard title='Actions' titleComponent='h5'>
              <Stack gap={1.5}>
                <ButtonLink
                  to={generatePath(AdminDashboardRoutes.PREVIEW_FORM, {
                    identifier: formIdentifier.identifier,
                    formId: formIdentifier.displayVersion.id,
                  })}
                  variant={hasDraft ? 'outlined' : 'contained'}
                  fullWidth
                  disabled={!isPublished}
                >
                  View Published Form
                </ButtonLink>
                {isPublished && (
                  <Typography variant='caption'>
                    Published on {parseAndFormatDate(publishedOn)}{' '}
                    {publishedBy && `by ${publishedBy.name}`}
                  </Typography>
                )}
                <RootPermissionsFilter permissions='canManageForms'>
                  <Divider />
                  <EditFormButton
                    formIdentifier={formIdentifier}
                    text={'Edit Draft'}
                    variant='outlined'
                  />
                  {hasDraft && (
                    <>
                      <ButtonLink
                        to={generatePath(
                          AdminDashboardRoutes.PREVIEW_FORM_DRAFT,
                          {
                            identifier: formIdentifier.identifier,
                            formId: formIdentifier.draftVersion?.id || '',
                          }
                        )}
                        variant='contained'
                        fullWidth
                      >
                        Preview / Publish Draft
                      </ButtonLink>
                      <Typography variant='caption'>
                        Last edited on {parseAndFormatDate(draftUpdatedOn)}{' '}
                        {draftUpdatedBy && `by ${draftUpdatedBy.name}`}
                      </Typography>
                    </>
                  )}
                </RootPermissionsFilter>
              </Stack>
            </CommonCard>
          </Grid>
        </Grid>
        <FormRulesCard
          formId={formIdentifier.displayVersion.id}
          formTitle={formIdentifier.displayVersion.title}
          formRole={formIdentifier.displayVersion.role}
          formCacheKey={formIdentifier.displayVersion.cacheKey}
        />
        <TitleCard
          title='Version History'
          headerVariant='border'
          headerTypographyVariant='h5'
          headerComponent='h2'
        >
          <FormVersionTable formIdentifier={formIdentifier.identifier} />
        </TitleCard>
      </Stack>
    </>
  );
};

export default FormDefinitionDetailPage;
