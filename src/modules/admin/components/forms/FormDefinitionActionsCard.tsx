import { Divider, Stack, Typography } from '@mui/material';

import React from 'react';
import { generatePath } from 'react-router';
import ButtonLink from '@/components/elements/ButtonLink';
import CommonCard from '@/components/elements/CommonCard';

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
  RetireFormDefinitionDocument,
  RetireFormDefinitionMutation,
  RetireFormDefinitionMutationVariables,
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
  // Only External Forms can be retired (enforced by RetireFormDefinition)
  const canRetire =
    isPublished &&
    canPublishForm &&
    formIdentifier.displayVersion.role === FormRole.ExternalForm;

  // Publishing in the Form Builder doesn't change the live External Form page; Publish to Public URL does
  const isPublishedExternalForm =
    isPublished && formIdentifier.displayVersion.role === FormRole.ExternalForm;
  const canPublishToPublicUrl = isPublishedExternalForm && canPublishForm;
  const showPublicUrlSection =
    isPublishedExternalForm &&
    (canPublishToPublicUrl || !!externalFormPublicUrl);
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
        {isPublished && (
          <Typography variant='caption'>
            Published {publishedOn ? formatRelativeDateTime(publishedOn) : ''}{' '}
            {publishedBy && `by ${publishedBy.name}`}
          </Typography>
        )}
        {showPublicUrlSection && (
          <>
            <Divider />
            {import.meta.env.MODE === 'development' && (
              <ButtonLink
                to={`/hmis_external_api/external_forms/${externalFormObjectKey}`}
                openInNew
                fullWidth
                Icon={NewTabIcon}
                disabled={!isPublished}
              >
                [Dev] View Public Form
              </ButtonLink>
            )}
            {externalFormPublicUrl && (
              <ButtonLink
                to={externalFormPublicUrl}
                openInNew
                fullWidth
                Icon={NewTabIcon}
              >
                View Public Form
              </ButtonLink>
            )}
          </>
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
                : externalFormPublicUrl
                  ? 'An older version is live at the public URL. Publish to update it.'
                  : 'This version has not been published to the public URL'}
            </Typography>
          </>
        )}
        {/* Show divider if any of the buttons below will be shown */}
        {((managedInVersionControl && canDuplicateForm) ||
          canManageForm ||
          (hasDraft && canPublishForm) ||
          canRetire) && <Divider />}
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
        {canRetire && (
          <GenericMutationButton<
            RetireFormDefinitionMutation,
            RetireFormDefinitionMutationVariables
          >
            queryDocument={RetireFormDefinitionDocument}
            variables={{ id: formIdentifier.displayVersion.id }}
            idPath='retireFormDefinition.formIdentifier.id'
            ButtonProps={{
              variant: 'outlined',
              color: 'error',
              fullWidth: true,
            }}
            ConfirmationDialogProps={{
              title: 'Retire Form',
              confirmText: 'Retire',
              color: 'error',
            }}
            dialogContent='Retiring this form stops it from being offered for new data entry. Existing records stay editable.'
          >
            Retire Form
          </GenericMutationButton>
        )}
      </Stack>
    </CommonCard>
  );
};
export default FormDefinitionActionsCard;
