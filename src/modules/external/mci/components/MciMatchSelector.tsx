import {
  Alert,
  Box,
  lighten,
  Stack,
  Switch,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import pluralize from 'pluralize';
import { ReactNode, useMemo } from 'react';

import { ClearanceStatus } from '../types';
import { NEW_MCI_STRING } from '../util';

import { MciClearanceProps } from './types';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import RouterLink from '@/components/elements/RouterLink';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import { MultiHmisEnum } from '@/modules/hmis/components/HmisEnum';
import {
  clientNameAllParts,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import { ClientNameFragment, MciMatchFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const MatchScore = ({ score }: { score: number }) => {
  const baseColor = useMemo(() => {
    if (score >= 95) return '#8BC34A'; // green
    return '#FB8C00'; // orange
  }, [score]);

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
      <Typography variant='inherit' sx={{ pt: 1 }}>
        {match.mciId}
      </Typography>
      {match.existingClientId && (
        <Alert severity='warning' sx={{ py: 1, my: 1, maxWidth: 500 }}>
          Client already exists in HMIS. If this is a match, please cancel and
          use the{' '}
          <RouterLink
            to={generateSafePath(Routes.CLIENT_DASHBOARD, {
              clientId: match.existingClientId,
            })}
            openInNew
          >
            <Typography variant='inherit'>existing client record</Typography>
          </RouterLink>
        </Alert>
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
        {clientNameAllParts(match as any as ClientNameFragment)}
      </Typography>
      <LabeledText label='Age' value={`${match.age}`} />
      <LabeledText label='DOB' value={parseAndFormatDate(match.dob)} />
      {match.ssn && <LabeledText label='SSN' value={match.ssn} />}
      {match.gender.length > 0 && (
        <LabeledText
          label='Gender'
          value={
            <MultiHmisEnum
              values={match.gender}
              enumMap={HmisEnums.Gender}
              noData={HmisEnums.Gender.DATA_NOT_COLLECTED}
              display='inline'
            />
          }
        />
      )}
    </Stack>
  );
};

const MciMatchSelector = ({
  value,
  onChange,
  matches,
  status,
  allowSelectingExistingClient = false,
}: Pick<MciClearanceProps, 'value' | 'onChange'> & {
  matches: MciMatchFieldsFragment[];
  status: ClearanceStatus;
  allowSelectingExistingClient?: boolean;
}) => {
  console.log(status);
  const autocleared =
    status === 'auto_cleared' || status === 'auto_cleared_existing_client';

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
      render: (m) => {
        if (m.existingClientId && !allowSelectingExistingClient) {
          return (
            <Typography color='text.secondary' variant='body2'>
              Client {m.existingClientId}
            </Typography>
          );
        }
        return (
          <ButtonTooltipContainer
            title={status === 'auto_cleared' ? 'Client auto-cleared' : null}
          >
            <Switch
              inputProps={{ 'aria-label': 'controlled' }}
              checked={value === m.mciId}
              onChange={handleChange(m.mciId)}
              disabled={status === 'auto_cleared'}
            />
          </ButtonTooltipContainer>
        );
      },
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
      {!autocleared && matches.length > 0 && (
        <Typography>
          {`${matches.length} ${pluralize('Match', matches.length)} Found`}
        </Typography>
      )}
      <GenericTable<MciMatchFieldsFragment>
        rows={matches}
        columns={columns}
        tableProps={{
          sx: {
            td: { py: 2 },
            borderTop: '1px solid white',
            borderColor: 'borders.light',
            'td:nth-of-type(2)': {
              borderLeft: '1px solid white',
              borderColor: 'borders.light',
            },
            'td:nth-of-type(3)': {
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
                    checked={value === NEW_MCI_STRING}
                    onChange={handleChange(NEW_MCI_STRING)}
                    disabled={value === NEW_MCI_STRING && matches.length === 0}
                  />
                </TableCell>
                <TableCell colSpan={2} sx={{ py: 3 }}>
                  New MCI ID
                </TableCell>
              </TableRow>
              {/* Sept 2023 - removed ability to intentionally create an uncleared client, per request. Leaving code in case it needs to be added back. */}
              {/* <TableRow>
                <TableCell>
                  <Switch
                    inputProps={{ 'aria-label': 'controlled' }}
                    checked={value === UNCLEARED_CLIENT_STRING}
                    onChange={handleChange(UNCLEARED_CLIENT_STRING)}
                  />
                </TableCell>
                <TableCell colSpan={2} sx={{ py: 3 }}>
                  <Stack direction={'row'} gap={1}>
                    Uncleared Client{' '}
                    <Typography
                      variant='inherit'
                      fontStyle={'italic'}
                      color='text.secondary'
                    >
                      (Not Recommmended)
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow> */}
            </>
          )
        }
      />
    </>
  );
};

export default MciMatchSelector;
