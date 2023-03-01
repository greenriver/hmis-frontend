import { Chip, Stack, Typography } from '@mui/material';
import { groupBy } from 'lodash-es';
import pluralize from 'pluralize';

import { ValidationWarningDisplay } from './ValidationErrorDisplay';

import ConfirmationDialog, {
  ConfirmationDialogProps,
} from '@/components/elements/ConfirmationDialog';
import SimpleAccordion from '@/components/elements/SimpleAccordion';
import { ValidationError } from '@/types/gqlTypes';

export interface FormWarningDialogProps
  extends Omit<ConfirmationDialogProps, 'children'> {
  warnings: ValidationError[];
  sectionLabels?: { [recordId: string]: string };
}

const FormWarningDialog = ({
  warnings,
  sectionLabels,
  ...props
}: FormWarningDialogProps) => {
  if (warnings.length === 0) return null;

  // Group warnings by record
  const warningsByRecordId = groupBy(warnings, 'recordId');

  let contents;
  if (sectionLabels && Object.keys(warningsByRecordId).length > 1) {
    contents = (
      <>
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
                <ValidationWarningDisplay warnings={warningsByRecordId[id]} />
              ),
            };
          })}
        />
      </>
    );
  } else {
    contents = <ValidationWarningDisplay warnings={warnings} />;
  }

  return (
    <ConfirmationDialog
      id='confirmSubmit'
      title='Ignore Warnings'
      maxWidth='sm'
      fullWidth
      {...props}
    >
      <Typography sx={{ mb: 3 }} variant='body2'>
        Please confirm the following warnings.
      </Typography>
      {contents}
    </ConfirmationDialog>
  );
};
export default FormWarningDialog;
