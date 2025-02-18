import SearchIcon from '@mui/icons-material/Search';
import { Alert, AlertTitle, Box, lighten, Stack } from '@mui/material';
import { Maybe } from 'graphql/jsutils/Maybe';
import { isEqual } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useWatch } from 'react-hook-form';
import { ClearanceState, ClearanceStatus } from '../types';

import { NEW_MCI_STRING } from '../util';
import {
  getClearanceAlertText,
  MciFieldsChangedAlert,
  MciSuccessAlert,
  MciUnavailableAlert,
} from './alerts';
import MciMatchSelector from './MciMatchSelector';

import { MciClearanceProps } from './types';
import LoadingButton from '@/components/elements/LoadingButton';
import usePrevious from '@/hooks/usePrevious';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { emptyErrorState, ErrorState, hasErrors } from '@/modules/errors/util';
import { formatDateForGql } from '@/modules/hmis/hmisUtil';
import {
  ClientNameObjectFieldsFragment,
  DobDataQuality,
  ExternalIdentifier,
  Gender,
  MciClearanceInput,
  NameDataQuality,
  useClearMciMutation,
} from '@/types/gqlTypes';

const CLEARANCE_REQUIRED_MSG = 'MCI clearance is required';

const initialClearanceState: ClearanceState = {
  status: 'initial',
  candidates: [],
};

const MciClearance = ({
  value,
  onChange,
  existingClient,
  error: hasValidationError,
  currentMciAttributes,
}: MciClearanceProps & {
  existingClient: boolean;
  currentMciAttributes: MciClearanceInput;
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
        if (matches.length === 0) {
          status = 'no_matches';
        } else if (matches[0].score >= 97 && !!matches[0].existingClientId) {
          status = 'auto_cleared_existing_client';
        } else if (matches[0].score >= 97) {
          status = 'auto_cleared';
        } else if (matches.length === 1) {
          status = 'one_match';
        } else {
          status = 'several_matches';
        }

        setState({ status, candidates: matches });
        // If auto-cleared, automatically select the match
        if (status === 'auto_cleared') {
          onChange(matches[0].mciId);
        }
        // If no matches, automatically select "new mci id"
        if (status === 'no_matches') {
          onChange(NEW_MCI_STRING);
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
  const previousMciAttributes = usePrevious(currentMciAttributes);
  useEffect(() => {
    if (status === 'initial') return;
    if (!isEqual(currentMciAttributes, previousMciAttributes)) {
      onChange(null);
      setState(initialClearanceState);
    }
  }, [status, onChange, currentMciAttributes, previousMciAttributes]);

  const handleSearch = useCallback(() => {
    if (!currentMciAttributes) return;
    onChange(null);
    setErrorState(emptyErrorState);
    // nested input due to base mutation class, needs backend fix to tidy this up
    clearMci({ variables: { input: { input: currentMciAttributes } } });
  }, [clearMci, onChange, currentMciAttributes]);

  const { title, subtitle, buttonText, rightAlignButton } = useMemo(
    () =>
      getClearanceAlertText({
        status,
        candidates,
        existingClient,
      }),
    [status, candidates, existingClient]
  );

  const searchButton = buttonText ? (
    <LoadingButton
      startIcon={<SearchIcon />}
      variant='outlined'
      sx={{ my: 2, ml: 1 }}
      loading={loading}
      type='button'
      onClick={handleSearch}
      size={rightAlignButton ? 'small' : 'large'}
    >
      {buttonText}
    </LoadingButton>
  ) : null;

  const errorMsg = useMemo(() => {
    // We assume this error boolean means that MCI clearance is required.
    // Note: Clearance is only required in SOME cases, but we don't need to worry about that here,
    // that logic is captured in HmisExternalApis ClientExtension validation methods.
    if (!hasValidationError) return;
    if (value) return; // user has made a selection

    // User has not performed the clearance yet
    if (status === 'initial') return CLEARANCE_REQUIRED_MSG;

    // User has performed the clearance but has not selected a match, AND
    // the match list includes 1 or more existing clients
    if (candidates.find((c) => !!c.existingClientId)) {
      return `${CLEARANCE_REQUIRED_MSG}. If an existing client is a match, please cancel and search for the existing client record.`;
    }

    // User has performed the clearance but has not yet selected a match.
    return 'Please make a selection';
  }, [candidates, hasValidationError, status, value]);

  return (
    <>
      {errorMsg && <Alert severity='error'>{errorMsg}</Alert>}
      {errorState && hasErrors(errorState) && (
        <Stack gap={1}>
          <ApolloErrorAlert error={errorState.apolloError} />
          <ErrorAlert errors={errorState.errors} />
        </Stack>
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

      {candidates && status !== 'initial' && !loading && (
        <MciMatchSelector
          value={value}
          onChange={onChange}
          matches={candidates}
          status={status}
          // Allow them to link to a duplicate MCI ID only if this client has already been saved.
          // That could happen if client was first created as Uncleared, and now they are clearing
          // and realizing that they should get the same MCI ID as an existing Client record.
          allowSelectingExistingClient={existingClient}
        />
      )}
    </>
  );
};

/**
 * Wrapper to handle whether MCI clearance is enabled/disabled.
 * Clearance is only possible if certain fields are filled in (first, last, dob)
 */
const MciClearanceWrapper = ({
  disabled,
  onChange,
  currentMciAttributes,
  ...props
}: MciClearanceProps & {
  existingClient: boolean;
  currentMciAttributes?: MciClearanceInput;
}) => {
  const mciSearchUnavailable = useMemo(() => {
    if (disabled) return true;
    if (!currentMciAttributes) return true;
  }, [disabled, currentMciAttributes]);

  // When enabled/disabled state changes, clear value
  useEffect(() => {
    onChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mciSearchUnavailable]);

  if (mciSearchUnavailable || !currentMciAttributes) {
    return (
      <>
        {props.error && !props.value && (
          <Alert severity='error'>{CLEARANCE_REQUIRED_MSG}</Alert>
        )}
        <MciUnavailableAlert />
      </>
    );
  }

  return (
    <MciClearance
      disabled={disabled}
      onChange={onChange}
      currentMciAttributes={currentMciAttributes}
      {...props}
    />
  );
};

/**
 * Wrapper to show existing MCI ID if client already has one.
 */
const MciClearanceWrapperWithValue = (props: MciClearanceProps) => {
  const { methods } = props.handlers;
  const { getValues } = methods;

  // this is coupled to the form definition
  const [names, dob, dobDq, gender, ssn]: [
    Maybe<ClientNameObjectFieldsFragment[]>, // names
    Maybe<Date>, // dob
    Maybe<{ code?: DobDataQuality }>, // db doq
    Maybe<{ code?: Gender }[]>, //gender
    Maybe<string>, //ssn/
  ] = useWatch({
    control: methods.control,
    name: ['names', 'dob', 'dob_dq', 'gender', 'ssn'],
  });

  const values = useMemo(() => getValues(), [getValues]);
  const clientId = values.client_id;
  const externalIds: ExternalIdentifier[] = values.current_mci_id;

  const currentMciAttributes = useMemo(() => {
    const primaryName = names?.find((name) => name.primary);

    // has the user entered the fields needed to clear MCI
    if (primaryName?.nameDataQuality !== NameDataQuality.FullNameReported)
      return;
    if (!(primaryName.first && primaryName.last)) return;
    if (!dob || dobDq?.code !== DobDataQuality.FullDobReported) return;
    const formattedDate = formatDateForGql(dob);
    if (!formattedDate) return;

    const result: MciClearanceInput = {
      dob: formattedDate,
      firstName: primaryName.first,
      middleName: primaryName.middle,
      lastName: primaryName.last,
      gender: gender?.map((i) => i.code).filter((i) => !!i),
      ssn: ssn,
    };
    return result;
  }, [names, dob, dobDq, gender, ssn]);

  const previousMciAttributes = usePrevious(currentMciAttributes);

  const [hasChanged, setHasChanged] = useState(false);
  useEffect(() => {
    if (!previousMciAttributes) return;

    const changed = !isEqual(currentMciAttributes, previousMciAttributes);
    if (changed) setHasChanged(true);
  }, [currentMciAttributes, previousMciAttributes]);

  // If client already has an MCI ID, just show that.
  // Post-MVP: allow re-clear
  if (externalIds && externalIds.length > 0 && externalIds[0].identifier) {
    if (!props.value) props.onChange(externalIds[0].identifier);

    return (
      <>
        <MciSuccessAlert mciIds={externalIds} />
        {hasChanged && <MciFieldsChangedAlert />}
      </>
    );
  }

  return (
    <MciClearanceWrapper
      {...props}
      currentMciAttributes={currentMciAttributes}
      existingClient={!!clientId}
    />
  );
};

export default MciClearanceWrapperWithValue;
