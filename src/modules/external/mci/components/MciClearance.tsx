import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  AlertTitle,
  Box,
  lighten,
  Stack,
  Switch,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { isNil, min } from 'lodash-es';
import pluralize from 'pluralize';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';

import ExternalIdDisplay from '@/components/elements/ExternalIdDisplay';
import GenericTable, { ColumnDef } from '@/components/elements/GenericTable';
import LoadingButton from '@/components/elements/LoadingButton';
import { useDashboardClient } from '@/components/pages/ClientDashboard';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { emptyErrorState, ErrorState, hasErrors } from '@/modules/errors/util';
import useDynamicFormContext from '@/modules/form/components/useDynamicFormContext';
import { DynamicInputCommonProps } from '@/modules/form/types';
import { createHudValuesForSubmit } from '@/modules/form/util/formUtil';
import { MultiHmisEnum } from '@/modules/hmis/components/HmisEnum';
import { clientNameAllParts } from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import {
  ClientNameFragment,
  ExternalIdentifier,
  MciMatchFieldsFragment,
  useClearMciMutation,
} from '@/types/gqlTypes';

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

type ClearanceStatus =
  | 'initial' // search available
  | 'no_matches' // no matches, click to search again, click to
  | 'one_match' // 1 match, click to search again, choose a match
  | 'several_matches' // x matches, click to search again, choose a match
  | 'auto_cleared'; // auto-cleared

type ClearanceState = {
  status: ClearanceStatus;
  candidates: MciMatchFieldsFragment[];
};
const initialClearanceState: ClearanceState = {
  status: 'initial',
  candidates: [],
};

const getClearanceAlertText = (state: ClearanceState) => {
  switch (state.status) {
    case 'initial':
      return {
        title: 'MCI ID Search Available',
        subtitle:
          'Based on the information provided above, MCI search is available for this client.',
        buttonText: 'Search for MCI ID',
      };
    case 'no_matches':
      return {
        title: 'No MCI ID Matches Found',
        subtitle:
          'Use the toggle to specify whether a new MCI ID should be created or not.',
        buttonText: 'Search Again',
      };
    case 'auto_cleared':
      return {
        title: 'MCI ID Found (auto-cleared)',
        subtitle: 'An exact match was found.',
        buttonText: null,
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
        buttonText: 'Search Again',
      };
  }
};

const NEW_MCI_STRING = '__CREATE_MCI_ID';
const UNCLEARED_CLIENT_STRING = '__UNCLEARED_CLIENT';

const matchScoreColorConfig: { [threshold: number]: string } = {
  95: '#8BC34A',
  80: '#FB8C00',
};
const MatchScore = ({
  score,
  config = matchScoreColorConfig,
}: {
  score: number;
  config?: typeof matchScoreColorConfig;
}) => {
  const thresholds = Object.keys(config).map((k) => parseInt(k));
  let key = thresholds.find((k) => score >= k);
  if (isNil(key)) key = min(thresholds);
  const baseColor = config[key as number];
  return (
    <Stack
      direction='row'
      sx={{
        backgroundColor: lighten(baseColor, 0.5),
        height: '14px',
        width: '120px',
      }}
    >
      <Box sx={{ backgroundColor: baseColor, width: `${score}%` }}></Box>
    </Stack>
  );
};

const MciScoreInfo = ({ match }: { match: MciMatchFieldsFragment }) => {
  return (
    <Stack gap={1}>
      <Typography variant='inherit'>
        <b>
          {match.score}
          {'% '}
        </b>
        match confidence
      </Typography>
      <MatchScore score={match.score} />
      <Typography variant='inherit' sx={{ pt: 2 }}>
        {match.mciId}
      </Typography>
      {match.existingClientId && (
        <Typography variant='inherit'>
          {/* TODO: link */}
          <b>Already in HMIS</b>
        </Typography>
      )}
    </Stack>
  );
};

const LabeledText = ({ value, label }: { value: ReactNode; label: string }) => (
  <Typography variant='inherit'>
    <b>{label}:</b> {value}
  </Typography>
);

const MciDemographicInfo = ({ match }: { match: MciMatchFieldsFragment }) => {
  return (
    <Stack gap={1}>
      <Typography variant='inherit'>
        {clientNameAllParts(match as ClientNameFragment)}
      </Typography>
      <LabeledText label='DOB' value={match.dob} />
      <LabeledText
        label='Age'
        value={`${match.age} ${pluralize('year', match.age)}`}
      />
      {match.ssn && <LabeledText label='SSN' value={match.ssn} />}
      <LabeledText
        label='Gender'
        value={
          <MultiHmisEnum
            values={match.gender}
            enumMap={HmisEnums.Gender}
            display='inline'
          />
        }
      />
    </Stack>
  );
};

const MciMatchSelector = ({
  value,
  onChange,
  matches,
  autocleared = false,
}: {
  value: string | null;
  onChange: Dispatch<SetStateAction<string | null>>;
  matches: MciMatchFieldsFragment[];
  autocleared?: boolean;
}) => {
  // TODO: disable toggle if it's an auto-clearance; and dont show the action row

  // console.log(value, matches);
  const handleChange =
    (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        onChange(id);
      } else {
        onChange(null);
      }
    };

  const columns: ColumnDef<MciMatchFieldsFragment>[] = [
    {
      key: 'toggle',
      width: '10%',
      render: (m) => (
        <Switch
          inputProps={{ 'aria-label': 'controlled' }}
          checked={value == m.mciId}
          onChange={handleChange(m.mciId)}
          disabled={autocleared}
        />
      ),
    },
    {
      key: 'score',
      render: (m) => <MciScoreInfo match={m} />,
    },
    {
      key: 'details',
      render: (m) => <MciDemographicInfo match={m} />,
    },
  ];

  return (
    <>
      <Typography>
        {`${matches.length} ${pluralize('Match', matches.length)} Found`}
      </Typography>
      <GenericTable<MciMatchFieldsFragment>
        rows={matches}
        columns={columns}
        tableProps={{
          sx: {
            td: { py: 2 },
            borderTop: '1px solid white',
            borderColor: 'borders.light',
            'td:nth-child(2)': {
              borderLeft: '1px solid white',
              borderColor: 'borders.light',
            },
            'td:nth-child(3)': {
              borderLeft: '1px solid white',
              borderColor: 'borders.light',
            },
          },
        }}
        actionRow={
          autocleared ? undefined : (
            <>
              <TableRow>
                <TableCell>
                  <Switch
                    inputProps={{ 'aria-label': 'controlled' }}
                    checked={value == NEW_MCI_STRING}
                    onChange={handleChange(NEW_MCI_STRING)}
                  />
                </TableCell>
                <TableCell colSpan={2} sx={{ py: 3 }}>
                  No match, create a new MCI ID
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Switch
                    inputProps={{ 'aria-label': 'controlled' }}
                    checked={value == UNCLEARED_CLIENT_STRING}
                    onChange={handleChange(UNCLEARED_CLIENT_STRING)}
                  />
                </TableCell>
                <TableCell colSpan={2} sx={{ py: 3 }}>
                  No match, leave uncleared (not recommmended)
                </TableCell>
              </TableRow>
            </>
          )
        }
      />
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MciClearance = ({ value, onChange }: MciClearanceProps) => {
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);
  const { getCleanedValues, definition } = useDynamicFormContext();
  const [{ status, candidates }, setState] = useState<ClearanceState>(
    initialClearanceState
  );
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  const [clearMci, { loading }] = useClearMciMutation({
    onCompleted: (data) => {
      const errors = data.clearMci?.errors || [];
      if (errors.length > 0) {
        setErrorState({ ...emptyErrorState, errors });
        setState(initialClearanceState);
      } else {
        const matches = data.clearMci?.matches || [];

        let status: ClearanceStatus;
        if (matches.length == 0) {
          status = 'no_matches';
        } else if (matches[0].score >= 97) {
          status = 'auto_cleared';
        } else if (matches.length === 1) {
          status = 'one_match';
        } else {
          status = 'several_matches';
        }

        console.log('Cleared MCI:', status, matches);
        setState({ status, candidates: matches });
        if (status == 'auto_cleared') {
          setSelectedMatch(matches[0].mciId);
        }
      }
    },
    onError: (apolloError) => {
      setErrorState({ ...emptyErrorState, apolloError });
      setState(initialClearanceState);
    },
  });

  // TODO: need form state to construct mutation input
  const onClickSearch = useCallback(() => {
    console.log(getCleanedValues ? getCleanedValues() : 'none');
    if (definition && getCleanedValues) {
      const currentFormValues = createHudValuesForSubmit(
        getCleanedValues(),
        definition
      );
      console.log(currentFormValues);
    }

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
  }, [clearMci, getCleanedValues]);

  const { title, subtitle, buttonText } = useMemo(
    () =>
      getClearanceAlertText({
        status,
        candidates,
      }),
    [status, candidates]
  );

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
        <AlertTitle>{title}</AlertTitle>
        {subtitle}
        {buttonText && (
          <Box sx={{ mt: 2, mb: 1 }}>
            <LoadingButton
              startIcon={<SearchIcon />}
              variant='outlined'
              sx={{ backgroundColor: 'transparent' }}
              loading={loading}
              type='button'
              onClick={onClickSearch}
            >
              {buttonText}
            </LoadingButton>
          </Box>
        )}
      </Alert>
      {errorState && hasErrors(errorState) && (
        <Stack gap={1} sx={{ mt: 4 }}>
          <ApolloErrorAlert error={errorState.apolloError} />
          <ErrorAlert errors={errorState.errors} />
        </Stack>
      )}
      {candidates && candidates.length > 0 && (
        <MciMatchSelector
          value={selectedMatch}
          onChange={setSelectedMatch}
          matches={candidates}
          autocleared={status == 'auto_cleared'}
        />
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
