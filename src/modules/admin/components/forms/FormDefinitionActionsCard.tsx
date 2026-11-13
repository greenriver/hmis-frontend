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

  const { externalFormObjectKey } = formIdentifier.displayVersion;
  const { managedInVersionControl, access } = formIdentifier;
  const { canManageForm, canPublishForm, canDuplicateForm } = access;
  // Only External Forms can be retired (enforced by RetireFormDefinition)
  const canRetire =
    isPublished &&
    canPublishForm &&
    formIdentifier.displayVersion.role === FormRole.ExternalForm;

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
            buttonTooltip={
              hasDraft
                ? 'Delete or publish the draft before retiring this form'
                : undefined
            }
            ButtonProps={{
              variant: 'outlined',
              color: 'error',
              fullWidth: true,
              disabled: hasDraft,
            }}
            ConfirmationDialogProps={{
              title: 'Retire Form',
              confirmText: 'Retire',
              color: 'error',
            }}
            dialogContent={
              <>
                Retiring this form removes it from data entry in Open Path.
                Existing records stay editable.
                {formIdentifier.displayVersion.role === FormRole.ExternalForm &&
                  ' Its External Form Key can then be used by another form. The public page stays online and submissions are still accepted until the page is taken down.'}
              </>
            }
          >
            Retire Form
          </GenericMutationButton>
        )}
      </Stack>
    </CommonCard>
  );
};
export default FormDefinitionActionsCard;
