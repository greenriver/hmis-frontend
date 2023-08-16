import { Alert, AlertTitle, Box, lighten, Stack } from '@mui/material';
import pluralize from 'pluralize';

import { ClearanceState } from '../types';

import ExternalIdDisplay from '@/components/elements/ExternalIdDisplay';
import { ExternalIdentifier } from '@/types/gqlTypes';

export const getClearanceAlertText = (state: ClearanceState) => {
  switch (state.status) {
    case 'initial':
      return {
        title: 'MCI Search Available',
        subtitle:
          'Based on the information provided above, MCI search is available for this client.',
        buttonText: 'Search for MCI ID',
      };
    case 'no_matches':
      return {
        title: 'No Matches Found',
        subtitle: 'You can create a new MCI ID, or leave the client uncleared.',
        // buttonText: 'Search Again',
        rightAlignButton: true,
      };
    case 'auto_cleared':
      return {
        title: 'MCI ID Found',
        subtitle: 'An exact match was found.',
        // buttonText: 'Search again',
        rightAlignButton: true,
      };
    case 'one_match':
    case 'several_matches':
      return {
        title: `( ${state.candidates.length} ) Possible MCI ID ${pluralize(
          'Match',
          state.candidates.length
        )} Found`,
        subtitle: `This client was matched with ${
          state.candidates.length > 1 ? 'multiple MCI IDs' : 'an MCI ID'
        }. You will need to confirm whether a correct match was found.`,
        rightAlignButton: true,
      };
  }
};

export const MciUnavailableAlert = () => (
  <Alert
    severity='warning'
    sx={{
      backgroundColor: (theme) => lighten(theme.palette.warning.light, 0.95),
      border: 'none',
    }}
  >
    <AlertTitle>Not enough information.</AlertTitle>
    <p>
      <b>First Name</b>, <b>Last Name</b>, and <b>Date of Birth</b> are required
      to clear MCI. Name Data Quality and DOB Data Quality must also be
      complete.
    </p>
    <p>You can save this record, but the client will be uncleared.</p>
  </Alert>
);

export const MciSuccessAlert = ({
  mciIds,
}: {
  mciIds: ExternalIdentifier[];
}) => (
  <Alert
    severity='success'
    sx={{
      backgroundColor: (theme) => lighten(theme.palette.success.light, 0.95),
      border: 'none',
    }}
  >
    <AlertTitle>Client has been cleared.</AlertTitle>
    <Stack direction='column' gap={1} sx={{ pt: 1 }}>
      {mciIds.map((mci) => (
        <ExternalIdDisplay value={mci} />
      ))}
    </Stack>
  </Alert>
);

export const MciFieldsChangedAlert = () => (
  <Alert
    severity='warning'
    sx={{
      backgroundColor: (theme) => lighten(theme.palette.warning.light, 0.95),
      border: 'none',
    }}
  >
    <AlertTitle>Some MCI-linked fields have been changed.</AlertTitle>
    <Box sx={{ pt: 1 }}>
      The client's <b>name, gender, DOB, </b> and <b>SSN</b> will be updated in
      MCI.
    </Box>
  </Alert>
);
