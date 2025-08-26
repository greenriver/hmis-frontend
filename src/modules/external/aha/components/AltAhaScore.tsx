import { Stack, Typography } from '@mui/material';
import { useCallback, useContext, useState } from 'react';
import LabelWithContent from '@/components/elements/LabelWithContent';
import LoadingButton from '@/components/elements/LoadingButton';
import AssessmentContext from '@/modules/assessments/components/AssessmentContext';
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

// Shows a button to calculate the score based on current form values, and displays the result.
const AltAhaScore = ({
  value,
  onChange,
  label,
  disabled = false,
  handlers,
}: AltAhaScoreProps) => {
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  const [calculateAltAhaScore, { loading }] = useCalculateAltAhaScoreMutation({
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

  const { formDefinitionIdentifier, enrollmentId } =
    useContext(AssessmentContext) || {};

  const hasRequiredContext = !!enrollmentId && !!formDefinitionIdentifier;

  const handleFetch = useCallback(() => {
    if (hasRequiredContext) {
      calculateAltAhaScore({
        variables: {
          enrollmentId,
          formDefinitionIdentifier: formDefinitionIdentifier,
          valuesByLinkId: handlers?.getValuesForSubmit().valuesByLinkId || {},
        },
      });
    }
  }, [
    hasRequiredContext,
    calculateAltAhaScore,
    enrollmentId,
    formDefinitionIdentifier,
    handlers,
  ]);

  return (
    <Stack direction='column' gap={1} alignItems='flex-start'>
      {label}
      {errorState && hasErrors(errorState) && (
        <Stack gap={1} sx={{ mb: 1 }}>
          <ApolloErrorAlert error={errorState.apolloError} inline />
          <ErrorAlert errors={errorState.errors} />
        </Stack>
      )}
      <LoadingButton
        loading={loading}
        // Disable the button if the disabled prop is passed down from the form item,
        // or if the form is being rendered outside of an assessment context (e.g. in the form preview)
        disabled={disabled || !hasRequiredContext}
        type='button'
        onClick={handleFetch}
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
