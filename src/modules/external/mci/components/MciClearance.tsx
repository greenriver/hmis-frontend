import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  AlertTitle,
  Box,
  lighten,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useState } from 'react';

import ExternalIdDisplay from '@/components/elements/ExternalIdDisplay';
import LoadingButton from '@/components/elements/LoadingButton';
import { useDashboardClient } from '@/components/pages/ClientDashboard';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { emptyErrorState, ErrorState, hasErrors } from '@/modules/errors/util';
import { DynamicInputCommonProps } from '@/modules/form/types';
import { ExternalIdentifier, useClearMciMutation } from '@/types/gqlTypes';

interface MciClearanceProps extends DynamicInputCommonProps {
  value?: string;
  onChange: (value: string) => void;
}

const MciUnavailableAlert = () => (
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

const MciSuccessAlert = ({ mci }: { mci: ExternalIdentifier }) => (
  <Alert
    severity='success'
    sx={{
      backgroundColor: (theme) => lighten(theme.palette.success.light, 0.95),
      border: 'none',
    }}
  >
    <AlertTitle>Client has been cleared.</AlertTitle>
    <Stack direction='row' gap={0.8}>
      <Typography variant='inherit'>MCI ID:</Typography>
      <ExternalIdDisplay value={mci} />
    </Stack>
  </Alert>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MciClearance = ({ value, onChange }: MciClearanceProps) => {
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);
  const [clearMci, { loading }] = useClearMciMutation({
    onCompleted: (data) => {
      const errors = data.clearMci?.errors || [];
      if (errors.length > 0) {
        setErrorState({ ...emptyErrorState, errors });
      } else {
        console.log('success!', data.clearMci?.matches);
      }
    },
    onError: (apolloError) =>
      setErrorState({ ...emptyErrorState, apolloError }),
  });

  // TODO: need form state to construct mutation input
  const onClickSearch = useCallback(() => {
    clearMci({
      variables: {
        input: {
          input: {
            firstName: 'KPOBUIBO',
            lastName: 'TNPPEZ',
            dob: '1973-02-20',
          },
        },
      },
    });
  }, [clearMci]);

  return (
    <>
      <Alert
        color='info'
        icon={false}
        sx={{
          backgroundColor: (theme) => lighten(theme.palette.info.light, 0.95),
          border: 'none',
        }}
      >
        <AlertTitle>MCI ID Search Available</AlertTitle>
        Based on the information provided above, MCI search is available for
        this client.
        <Box sx={{ mt: 2, mb: 1 }}>
          <LoadingButton
            startIcon={<SearchIcon />}
            variant='outlined'
            sx={{ backgroundColor: 'transparent' }}
            loading={loading}
            type='button'
            onClick={onClickSearch}
          >
            Search for MCI ID
          </LoadingButton>
        </Box>
      </Alert>
      {errorState && hasErrors(errorState) && (
        <Stack gap={1} sx={{ mt: 4 }}>
          <ApolloErrorAlert error={errorState.apolloError} />
          <ErrorAlert errors={errorState.errors} />
        </Stack>
      )}
    </>
  );
};

const MciClearanceWrapper = (props: MciClearanceProps) => {
  // Dashboard context would be present only if we are editing an existing client
  const ctx = useDashboardClient();

  if (props.disabled) return <MciUnavailableAlert />;

  if (ctx && ctx.client) {
    const mci = ctx.client.externalIds.find((c) => c.label == 'MCI ID');
    if (mci) return <MciSuccessAlert mci={mci} />;
  }

  return <MciClearance {...props} />;
};
export default MciClearanceWrapper;
