import { Divider, Stack, Typography } from '@mui/material';

import React from 'react';
import { generatePath } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import { CommonCard } from '@/components/elements/CommonCard';

import DuplicateFormButton from '@/modules/admin/components/forms/DuplicateFormButton';
import EditFormButton from '@/modules/admin/components/forms/EditFormButton';
import {
  formatRelativeDateTime,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { AdminDashboardRoutes } from '@/routes/routes';
import { FormIdentifierDetailsFragment, FormStatus } from '@/types/gqlTypes';

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

  return (
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
            Published {publishedOn ? formatRelativeDateTime(publishedOn) : ''}{' '}
            {publishedBy && `by ${publishedBy.name}`}
          </Typography>
        )}
        <RootPermissionsFilter permissions='canManageForms'>
          <Divider />
          {formIdentifier.managedInVersionControl ? (
            <DuplicateFormButton formIdentifier={formIdentifier} />
          ) : (
            <>
              <EditFormButton
                formIdentifier={formIdentifier}
                text={'Edit Draft'}
                variant='outlined'
              />
              {hasDraft && (
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
                    {draftUpdatedOn
                      ? formatRelativeDateTime(draftUpdatedOn)
                      : ''}{' '}
                    {draftUpdatedBy && `by ${draftUpdatedBy.name}`}
                  </Typography>
                </>
              )}
            </>
          )}
        </RootPermissionsFilter>
      </Stack>
    </CommonCard>
  );
};
export default FormDefinitionActionsCard;
