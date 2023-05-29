import SearchIcon from '@mui/icons-material/Search';
import { Alert, AlertTitle, Box, lighten, Stack } from '@mui/material';
import { find, isEqual, omit, pick } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ClearanceState, ClearanceStatus } from '../types';
import { UNCLEARED_CLIENT_STRING } from '../util';

import {
  getClearanceAlertText,
  MciSuccessAlert,
  MciUnavailableAlert,
} from './alerts';
import MciMatchSelector from './MciMatchSelector';

import LoadingButton from '@/components/elements/LoadingButton';
import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import usePrevious from '@/hooks/usePrevious';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { emptyErrorState, ErrorState, hasErrors } from '@/modules/errors/util';
import useDynamicFormContext from '@/modules/form/hooks/useDynamicFormContext';
import { DynamicInputCommonProps } from '@/modules/form/types';
import { createHudValuesForSubmit } from '@/modules/form/util/formUtil';
import { NameDataQuality, useClearMciMutation } from '@/types/gqlTypes';

export interface MciClearanceProps extends DynamicInputCommonProps {
  value?: string | null;
  onChange: (value?: string | null) => void;
}

const MCI_CLEARANCE_FIELDS = ['names', 'dob', 'gender', 'ssn'] as const;

const initialClearanceState: ClearanceState = {
  status: 'initial',
  candidates: [],
};

const MciClearance = ({
  value,
  onChange,
  existingClient,
  error: hasValidationError,
  currentFormValues,
}: MciClearanceProps & {
  existingClient: boolean;
  currentFormValues: Record<typeof MCI_CLEARANCE_FIELDS[number], any>;
}) => {
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);
  const [{ status, candidates }, setState] = useState<ClearanceState>(
    initialClearanceState
  );

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

        console.debug('Cleared MCI:', status, matches);
        setState({ status, candidates: matches });
        if (status == 'auto_cleared') {
          onChange(matches[0].mciId);
        }
        setErrorState(emptyErrorState);
      }
    },
    onError: (apolloError) => {
      setErrorState({ ...emptyErrorState, apolloError });
      setState(initialClearanceState);
    },
  });

  // When MCI-related fields change, re-set to initial state
  const previousFormValues = usePrevious(currentFormValues);
  useEffect(() => {
    const relevantFieldChanged = !isEqual(
      currentFormValues,
      previousFormValues
    );
    if (relevantFieldChanged && status !== 'initial') {
      onChange(null);
      setState(initialClearanceState);
    }
  }, [status, onChange, currentFormValues, previousFormValues]);

  const handleSearch = useCallback(() => {
    if (!currentFormValues) return;
    console.debug('Clearing MCI with input', currentFormValues);
    onChange(null);

    const primaryName = find(currentFormValues.names, { primary: true });
    if (!primaryName) return;

    const input = {
      ...omit(currentFormValues, 'names'),
      firstName: primaryName.first,
      middleName: primaryName.middle,
      lastName: primaryName.last,
    };
    clearMci({ variables: { input: { input } } });
  }, [clearMci, onChange, currentFormValues]);

  const { title, subtitle, buttonText, rightAlignButton } = useMemo(
    () =>
      getClearanceAlertText({
        status,
        candidates,
      }),
    [status, candidates]
  );

  const searchButton = buttonText ? (
    <LoadingButton
      startIcon={<SearchIcon />}
      variant='outlined'
      sx={{ backgroundColor: 'transparent' }}
      loading={loading}
      type='button'
      onClick={handleSearch}
      size={rightAlignButton ? 'small' : undefined}
    >
      {buttonText}
    </LoadingButton>
  ) : null;

  return (
    <>
      {hasValidationError && !value && (
        <Alert severity='error'>
          {status === 'initial'
            ? 'MCI search is required.'
            : 'Please make a selection.'}
        </Alert>
      )}
      <Alert
        color='info'
        icon={false}
        sx={{
          backgroundColor: (theme) => lighten(theme.palette.info.light, 0.95),
          border: 'none',
          '.MuiAlert-message': { width: '100%' },
        }}
      >
        <AlertTitle>
          <Stack flexDirection={'row'} justifyContent='space-between'>
            {loading ? 'Searching MCI...' : title}
            {rightAlignButton ? searchButton : null}
          </Stack>
        </AlertTitle>
        {loading ? null : subtitle}
        {searchButton && !rightAlignButton && (
          <Box sx={{ mt: 2, mb: 1 }}>{searchButton}</Box>
        )}
      </Alert>
      {errorState && hasErrors(errorState) && (
        <Stack gap={1} sx={{ mt: 4 }}>
          <ApolloErrorAlert error={errorState.apolloError} />
          <ErrorAlert errors={errorState.errors} />
        </Stack>
      )}

      {candidates && status !== 'initial' && !loading && (
        <MciMatchSelector
          value={value}
          onChange={onChange}
          matches={candidates}
          autocleared={status == 'auto_cleared'}
          // Only allow them to link a duplicate if this client has already been saved.
          allowSelectingExistingClient={existingClient}
        />
      )}
    </>
  );
};

const MciClearanceWrapper = ({
  disabled,
  onChange,
  ...props
}: MciClearanceProps) => {
  // Dashboard context would be present only if we are editing an existing client
  const ctx = useClientDashboardContext();

  const { getCleanedValues, definition } = useDynamicFormContext();
  // Gets re-calculated any time one of the dependent values changes (because of enableWhen dependency)
  const currentFormValues = useMemo(() => {
    if (!definition || !getCleanedValues) {
      console.error('Context missing, unable to do MCI search');
      return;
    }
    const values = createHudValuesForSubmit(getCleanedValues(), definition);
    return pick(values, [...MCI_CLEARANCE_FIELDS, 'names']);
  }, [definition, getCleanedValues]);

  const mciSearchUnavailable = useMemo(() => {
    if (disabled) return true;
    if (!currentFormValues) return true;

    const primaryName = find(currentFormValues.names, { primary: true });
    if (!primaryName) return true;

    return (
      !primaryName.first ||
      !primaryName.last ||
      primaryName.nameDataQuality !== NameDataQuality.FullNameReported
    );
  }, [disabled, currentFormValues]);

  // If element becomes disabled, set value to uncleared
  // If element becomes enabled, set value to null
  useEffect(() => {
    if (mciSearchUnavailable) {
      onChange(UNCLEARED_CLIENT_STRING);
    } else {
      onChange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mciSearchUnavailable]);

  if (mciSearchUnavailable || !currentFormValues)
    return <MciUnavailableAlert />;

  const isExistingClient = !!(ctx && ctx.client);
  if (isExistingClient) {
    // If client already has an MCI ID, just show that.
    // Post-MVP: allow re-clear
    const mci = ctx.client.externalIds.find((c) => c.label == 'MCI ID');
    if (mci && mci.identifier) return <MciSuccessAlert mci={mci} />;
  }

  return (
    <MciClearance
      disabled={disabled}
      onChange={onChange}
      existingClient={isExistingClient}
      currentFormValues={currentFormValues}
      {...props}
    />
  );
};
export default MciClearanceWrapper;
