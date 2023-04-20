import SearchIcon from '@mui/icons-material/Search';
import { Alert, AlertTitle, Box, lighten } from '@mui/material';
import { useState } from 'react';

import LoadingButton from '@/components/elements/LoadingButton';
import { emptyErrorState, ErrorState } from '@/modules/errors/util';
import { DynamicInputCommonProps } from '@/modules/form/types';
import { useClearMciMutation } from '@/types/gqlTypes';

interface MciClearanceProps extends DynamicInputCommonProps {
  value?: string;
  onChange: (value: string) => void;
}

const MciUnavailable = () => (
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
      to clear MCI. You can save this client record, but note that the client
      will be uncleared.
    </p>
  </Alert>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MciClearance = ({ value, onChange }: MciClearanceProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [clearMci, { loading }] = useClearMciMutation({
    onCompleted: (data) => {
      const errors = data.clearMci?.errors || [];
      if (errors.length > 0) {
        setErrorState({ ...emptyErrorState, errors });
      } else {
        console.log('success!', data);
      }
    },
    onError: (apolloError) =>
      setErrorState({ ...emptyErrorState, apolloError }),
  });

  // TODO: need form state to construct mutation input
  return (
    <Alert
      color='info'
      icon={false}
      sx={{
        backgroundColor: (theme) => lighten(theme.palette.info.light, 0.95),
        border: 'none',
      }}
    >
      <AlertTitle>MCI ID Search Available</AlertTitle>
      Based on the information provided above, MCI search is available for this
      client.
      <Box sx={{ mt: 2, mb: 1 }}>
        <LoadingButton
          startIcon={<SearchIcon />}
          variant='outlined'
          sx={{ backgroundColor: 'transparent' }}
          loading={loading}
        >
          Search for MCI ID
        </LoadingButton>
      </Box>
    </Alert>
  );
};

const MciClearanceWrapper = (props: MciClearanceProps) => {
  console.log('disabled', props.disabled);
  if (props.disabled) return <MciUnavailable />;
  return <MciClearance {...props} />;
};
export default MciClearanceWrapper;
