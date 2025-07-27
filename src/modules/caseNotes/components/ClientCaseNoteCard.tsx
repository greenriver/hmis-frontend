import { Box, Typography } from '@mui/material';
import { Stack, SxProps } from '@mui/system';
import React from 'react';
import CommonCard from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import CommonMenuButton from '@/components/elements/CommonMenuButton';
import MultilineTypography from '@/components/elements/MultilineTypography';
import { getViewEnrollmentMenuItem } from '@/components/elements/table/tableRowActionUtil';
import {
  customDataElementValueAsString,
  entryExitRange,
  lastUpdatedBy,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { ClientNameFragment, GetClientCaseNotesQuery } from '@/types/gqlTypes';

type CaseNoteWithEnrollment = NonNullable<
  GetClientCaseNotesQuery['client']
>['customCaseNotes']['nodes'][0];

interface CaseNoteCardProps {
  caseNote: CaseNoteWithEnrollment;
  client: ClientNameFragment;
  linkToEnrollment?: boolean;
  sx?: SxProps;
}

/**
 * Card for displaying a single case note with its details.
 *
 * This is used for the card display in the Client Case Notes table, as well as the print view.
 */
const ClientCaseNoteCard: React.FC<CaseNoteCardProps> = ({
  caseNote,
  client,
  linkToEnrollment = false,
  sx,
}) => {
  const customDataElementDisplays = caseNote.customDataElements.map((cde) => ({
    id: cde.id,
    label: cde.label,
    displayValue: customDataElementValueAsString(cde)?.toString() || '',
  }));

  return (
    <CommonCard sx={sx}>
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Typography variant='caption'>
          {`${caseNote.enrollment.projectName} (${entryExitRange(caseNote.enrollment)})`}
        </Typography>
        {linkToEnrollment && (
          <CommonMenuButton
            iconButton
            title='View Enrollment'
            items={[getViewEnrollmentMenuItem(caseNote.enrollment, client)]}
            ButtonProps={{ sx: { p: 0 } }}
          />
        )}
      </Stack>
      <Stack sx={{ my: 1 }}>
        {caseNote.informationDate && (
          <CommonLabeledTextBlock title='Information Date' horizontal>
            {parseAndFormatDate(caseNote.informationDate)}
          </CommonLabeledTextBlock>
        )}
        {caseNote.dateCreated && (
          <CommonLabeledTextBlock title='Created At' horizontal>
            {lastUpdatedBy({
              dateUpdated: caseNote.dateCreated,
              user: caseNote.createdBy,
              dateFormat: 'timestamp',
            })}
          </CommonLabeledTextBlock>
        )}
        {caseNote.dateUpdated &&
          caseNote.dateUpdated !== caseNote.dateCreated && (
            <CommonLabeledTextBlock title='Updated At' horizontal>
              {lastUpdatedBy({
                dateUpdated: caseNote.dateUpdated,
                user: caseNote.user,
                dateFormat: 'timestamp',
              })}
            </CommonLabeledTextBlock>
          )}
        {customDataElementDisplays.map(({ id, label, displayValue }) => (
          <CommonLabeledTextBlock
            key={id}
            title={label}
            horizontal={displayValue.length < 100}
          >
            {displayValue}
          </CommonLabeledTextBlock>
        ))}
      </Stack>
      <Box>
        <MultilineTypography>{caseNote.content}</MultilineTypography>
      </Box>
    </CommonCard>
  );
};

export default ClientCaseNoteCard;
