import { Stack, Typography } from '@mui/material';
import { useState } from 'react';
import LabelWithContent from '@/components/elements/LabelWithContent';
import LoadingButton from '@/components/elements/LoadingButton';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { emptyErrorState, ErrorState, hasErrors } from '@/modules/errors/util';
import { FormDefinitionHandlers } from '@/modules/form/hooks/useFormDefinitionHandlers';
import { DynamicInputCommonProps } from '@/modules/form/types';
import { useFetchAhaScoreMutation } from '@/types/gqlTypes';

const AhaScore = ({
  handlers,
  value,
  onChange,
  disabled,
  label,
  helperText,
}: {
  handlers?: FormDefinitionHandlers;
  value: string;
  onChange: (value: string | undefined) => void;
} & DynamicInputCommonProps) => {
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  const clientId = handlers?.localConstants.clientId;

  const [fetchAha, { loading }] = useFetchAhaScoreMutation({
    variables: {
      clientId: clientId,
    },
    onCompleted: (data) => {
      const errors = data.fetchAhaScore?.errors || [];
      if (errors.length > 0) {
        setErrorState({ ...emptyErrorState, errors });
        return;
      }

      setErrorState(emptyErrorState);
      // TODO(#7812) If score is not available (or bad quality?), calculate alt-AHA
      onChange(data.fetchAhaScore?.score || undefined);
    },
    onError: (apolloError) => {
      setErrorState({ ...emptyErrorState, apolloError });
      onChange(undefined);
    },
  });

  return (
    <>
      {errorState && hasErrors(errorState) && (
        <Stack gap={1}>
          <ApolloErrorAlert error={errorState.apolloError} />
          <ErrorAlert errors={errorState.errors} />
        </Stack>
      )}
      <LabelWithContent label={label} helperText={helperText}>
        <Stack direction='row' gap={1} alignItems='center'>
          <LoadingButton
            variant='outlined'
            loading={loading}
            disabled={disabled}
            type='button'
            onClick={() => fetchAha()}
          >
            Fetch AHA Score
          </LoadingButton>
          {value && (
            <Typography variant='body2'>
              <b>Score:</b> {value}
            </Typography>
          )}
        </Stack>
      </LabelWithContent>
    </>
  );
};

export default AhaScore;
