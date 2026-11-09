import { Divider, Stack, Typography } from '@mui/material';

import React from 'react';
import { generatePath } from 'react-router';
import ButtonLink from '@/components/elements/ButtonLink';
import CommonCard from '@/components/elements/CommonCard';
import ExternalLink from '@/components/elements/ExternalLink';

import NewTabIcon from '@/components/elements/NewTabIcon';
import DuplicateFormButton from '@/modules/admin/components/forms/DuplicateFormButton';
import EditFormButton from '@/modules/admin/components/forms/EditFormButton';
import GenericMutationButton from '@/modules/dataFetching/components/GenericMutationButton';
import {
  formatRelativeDateTime,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  FormIdentifierDetailsFragment,
  FormRole,
  FormStatus,
  PublishExternalFormDocument,
  PublishExternalFormMutation,
  PublishExternalFormMutationVariables,
} from '@/types/gqlTypes';

interface Props {
  formIdentifier: FormIdentifierDetailsFragment;
}

const FormDefinitionActionsCard: React.FC<Props> = ({ formIdentifier }) => {
  const isPublished =
    formIdentifier.displayVersion.status === FormStatus.Published;
  const hasDraft = !!formIdentifier.draftVersion;

  const publishedBy = isPublished
    ? formIdentifier.displayVersion.updatedBy
    : undefined;
  const publishedOn = isPublished
    ? parseHmisDateString(formIdentifier.displayVersion.dateUpdated)
    : undefined;

  const draftUpdatedBy = hasDraft
    ? formIdentifier.draftVersion?.updatedBy
    : undefined;
  const draftUpdatedOn = hasDraft
    ? parseHmisDateString(formIdentifier.draftVersion?.dateUpdated)
    : undefined;

  const {
    externalFormObjectKey,
    externalFormPublicUrl,
    externalFormLastPublishedAt,
  } = formIdentifier.displayVersion;
  const { managedInVersionControl, access } = formIdentifier;
  const { canManageForm, canPublishForm, canDuplicateForm } = access;

  // Publishing in the Form Builder doesn't change the live External Form page; this action does
  const canPublishToPublicUrl =
    isPublished &&
    canPublishForm &&
    formIdentifier.displayVersion.role === FormRole.ExternalForm;
  const publicUrlPublishedOn = parseHmisDateString(externalFormLastPublishedAt);

  return (
    <CommonCard title='Actions' TitleComponent='h5'>
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
        {/* In Dev only, expose link to external form preview. This is not available in non-dev environments. */}
        {externalFormObjectKey && import.meta.env.MODE === 'development' && (
          <ButtonLink
            to={`/hmis_external_api/external_forms/${externalFormObjectKey}`}
            openInNew
            fullWidth
            Icon={NewTabIcon}
            disabled={!isPublished}
          >
            External Form Preview
          </ButtonLink>
        )}
        {isPublished && (
          <Typography variant='caption'>
            Published {publishedOn ? formatRelativeDateTime(publishedOn) : ''}{' '}
            {publishedBy && `by ${publishedBy.name}`}
          </Typography>
        )}
        {canPublishToPublicUrl && (
          <>
            <GenericMutationButton<
              PublishExternalFormMutation,
              PublishExternalFormMutationVariables
            >
              queryDocument={PublishExternalFormDocument}
              variables={{ id: formIdentifier.displayVersion.id }}
              idPath='publishExternalForm.formIdentifier.id'
              ButtonProps={{ variant: 'outlined', fullWidth: true }}
              ConfirmationDialogProps={{
                title: 'Publish to Public URL',
                confirmText: 'Publish',
              }}
              dialogContent='This replaces the live public page with the published version of this form.'
            >
              Publish to Public URL
            </GenericMutationButton>
            <Typography variant='caption'>
              {publicUrlPublishedOn
                ? `Published to public URL ${formatRelativeDateTime(publicUrlPublishedOn)}`
                : 'This version has not been published to the public URL'}
            </Typography>
            {externalFormPublicUrl && (
              <ExternalLink href={externalFormPublicUrl} variant='body2'>
                View public form
              </ExternalLink>
            )}
          </>
        )}
        {/* Show divider if any of the buttons below will be shown */}
        {((managedInVersionControl && canDuplicateForm) ||
          canManageForm ||
          (hasDraft && canPublishForm)) && <Divider />}
        {managedInVersionControl && canDuplicateForm && (
          <DuplicateFormButton formIdentifier={formIdentifier} />
        )}
        {canManageForm && (
          <EditFormButton
            formIdentifier={formIdentifier}
            text={'Edit Draft'}
            variant='outlined'
          />
        )}
        {hasDraft && canPublishForm && (
          <>
            <ButtonLink
              to={generatePath(AdminDashboardRoutes.PREVIEW_FORM_DRAFT, {
                identifier: formIdentifier.identifier,
                formId: formIdentifier.draftVersion?.id || '',
              })}
              variant='contained'
              fullWidth
            >
              Preview / Publish Draft
            </ButtonLink>
            <Typography variant='caption'>
              Last edited{' '}
              {draftUpdatedOn ? formatRelativeDateTime(draftUpdatedOn) : ''}{' '}
              {draftUpdatedBy && `by ${draftUpdatedBy.name}`}
            </Typography>
          </>
        )}
      </Stack>
    </CommonCard>
  );
};
export default FormDefinitionActionsCard;
