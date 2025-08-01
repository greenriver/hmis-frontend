import { Stack, Typography } from '@mui/material';
import { useState } from 'react';
import LabelWithContent from '@/components/elements/LabelWithContent';
import LoadingButton from '@/components/elements/LoadingButton';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { emptyErrorState, ErrorState, hasErrors } from '@/modules/errors/util';
import { FormDefinitionHandlers } from '@/modules/form/hooks/useFormDefinitionHandlers';
import { DynamicInputCommonProps } from '@/modules/form/types';
import {
  CalculateAltAhaScoreMutation,
  useCalculateAltAhaScoreMutation,
} from '@/types/gqlTypes';

interface AltAhaScoreProps extends DynamicInputCommonProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  handlers?: FormDefinitionHandlers;
}

// Simple input component for calculating Alt AHA score. Shows a button to calculate the score
// based on current form values, and displays the result.
const AltAhaScore = ({
  value,
  onChange,
  label,
  disabled = false, // todo @martha - add rules to make it disabled unless the other form values are filled?
  handlers,
}: AltAhaScoreProps) => {
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  const { valuesByLinkId } = handlers?.getValuesForSubmit() || {};

  const [calculateAltAhaScore, { loading }] = useCalculateAltAhaScoreMutation({
    variables: {
      valuesByLinkId,
    },
    onCompleted: (data: CalculateAltAhaScoreMutation) => {
      const errors = data.calculateAltAhaScore?.errors || [];
      if (errors.length > 0) {
        setErrorState({ ...emptyErrorState, errors });
        return;
      }

      setErrorState(emptyErrorState);

      if (onChange && data.calculateAltAhaScore) {
        onChange(data.calculateAltAhaScore.score || null);
      }
    },
    onError: (apolloError: any) => {
      setErrorState({ ...emptyErrorState, apolloError });
    },
  });

  return (
    <Stack direction='column' gap={1} alignItems='flex-start'>
      {label}
      {errorState && hasErrors(errorState) && (
        <Stack gap={1} sx={{ mb: 1 }}>
          <ApolloErrorAlert error={errorState.apolloError} />
          <ErrorAlert errors={errorState.errors} />
        </Stack>
      )}
      <LoadingButton
        loading={loading}
        disabled={disabled}
        type='button'
        onClick={() => calculateAltAhaScore()}
        sx={{ my: 1 }}
      >
        Calculate Alt-AHA Score
      </LoadingButton>

      {value && (
        <LabelWithContent label='Alt-AHA Score'>
          <Typography variant='body2'>{value}</Typography>
        </LabelWithContent>
      )}
    </Stack>
  );
};

export default AltAhaScore;
