import { Chip, Stack, Typography } from '@mui/material';
import { groupBy } from 'lodash-es';
import pluralize from 'pluralize';

import {
  ErrorRenderFn,
  ErrorState,
  hasAnyValue,
  UNKNOWN_ERROR_HEADING,
} from '../util';

import ConfirmationDialog, {
  ConfirmationDialogProps,
} from '@/components/elements/ConfirmationDialog';
import SimpleAccordion from '@/components/elements/SimpleAccordion';
import WarningAlert from '@/modules/errors/components/WarningAlert';
import { ValidationError } from '@/types/gqlTypes';

type SectionLabels = { [recordId: string]: string };

type WarningProps = {
  errorState: ErrorState;
  sectionLabels?: SectionLabels;
};
export type ValidationDialogProps = Omit<ConfirmationDialogProps, 'children'> &
  WarningProps;

// Display warnings grouped by Record ID in an Accordion
const WarningAccordion = ({
  warnings,
  sectionLabels,
  renderError,
}: {
  warnings: ValidationError[];
  sectionLabels: SectionLabels;
  renderError?: ErrorRenderFn;
}) => {
  const warningsByRecordId = groupBy(warnings, 'recordId');
  return (
    <SimpleAccordion
      renderHeader={(header) => header}
      renderContent={(content) => content}
      AccordionProps={{ defaultExpanded: true }}
      AccordionDetailsProps={{ sx: { px: 0, pb: 0 } }}
      items={Object.keys(warningsByRecordId).map((id) => {
        return {
          key: sectionLabels[id] || 'other',
          header: (
            <Stack
              direction='row'
              gap={1}
              justifyContent='space-between'
              width='99%'
            >
              <Typography fontWeight={800}>
                {sectionLabels[id] || 'Other Warnings'}
              </Typography>
              <Chip
                label={pluralize(
                  'warning',
                  warningsByRecordId[id].length,
                  true
                )}
                variant='outlined'
                size='small'
              />
            </Stack>
          ),
          content: (
            <WarningAlert
              warnings={warningsByRecordId[id]}
              renderError={renderError}
            />
          ),
        };
      })}
    />
  );
};

/**
 * Dialog for rendering errors or confirming warnings
 */
const ValidationDialog = ({
  errorState,
  sectionLabels,
  renderError,
  ...props
}: ValidationDialogProps) => {
  if (!hasAnyValue(errorState)) return null;
  const { errors, warnings } = errorState;

  const hasErrors = errors.length > 0;

  let warningContent;
  if (!hasErrors && warnings.length > 0) {
    warningContent = sectionLabels ? (
      <WarningAccordion
        warnings={warnings}
        sectionLabels={sectionLabels}
        renderError={renderError}
      />
    ) : (
      <WarningAlert warnings={warnings} renderError={renderError} />
    );
  }

  return (
    <ConfirmationDialog
      id='confirmSubmit'
      title={warningContent ? 'Ignore Warnings' : UNKNOWN_ERROR_HEADING}
      maxWidth='sm'
      fullWidth
      // we want to handle warning rendering here, so don't pass it
      errorState={hasErrors ? errorState : undefined}
      renderError={renderError}
      {...props}
    >
      {warningContent && (
        <>
          <Typography sx={{ mb: 3 }} variant='body2'>
            Please confirm the following warnings.
          </Typography>
          {warningContent}
        </>
      )}
    </ConfirmationDialog>
  );
};
export default ValidationDialog;
