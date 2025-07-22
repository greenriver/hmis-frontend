import { Box, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';
import CommonCard from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import MultilineTypography from '@/components/elements/MultilineTypography';
import {
  customDataElementValueAsString,
  entryExitRange,
  lastUpdatedBy,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { GetClientCaseNotesQuery } from '@/types/gqlTypes';

type CaseNoteWithEnrollment = NonNullable<
  GetClientCaseNotesQuery['client']
>['customCaseNotes']['nodes'][0];

interface CaseNoteCardProps {
  caseNote: CaseNoteWithEnrollment;
}

const CaseNoteCard: React.FC<CaseNoteCardProps> = ({ caseNote }) => {
  return (
    <CommonCard>
      <Typography variant='caption' sx={{ mb: 2 }}>
        {`${caseNote.enrollment.projectName} (${entryExitRange(caseNote.enrollment)})`}
      </Typography>
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
        {caseNote.customDataElements.map((cde) => (
          <CommonLabeledTextBlock key={cde.id} title={cde.label} horizontal>
            {customDataElementValueAsString(cde)}
          </CommonLabeledTextBlock>
        ))}
      </Stack>
      <Box>
        <MultilineTypography>{caseNote.content}</MultilineTypography>
      </Box>
    </CommonCard>
  );
};

export default CaseNoteCard;
