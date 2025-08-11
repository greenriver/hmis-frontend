import { Stack, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import LabelWithContent from '@/components/elements/LabelWithContent';
import LoadingButton from '@/components/elements/LoadingButton';
import { DUMMY_LOCAL_CONSTANT } from '@/modules/admin/components/forms/FormPreview';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { emptyErrorState, ErrorState, hasErrors } from '@/modules/errors/util';
import useDynamicFormContext from '@/modules/form/hooks/useDynamicFormContext';
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
  const { identifier } = useDynamicFormContext();
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

  const handleFetch = useCallback(() => {
    const enrollmentId = handlers?.localConstants.enrollmentId;

    if (enrollmentId === DUMMY_LOCAL_CONSTANT) {
      // If this is the preview environment, mock the response instead of calling the mutation
      onChange?.(10);
    } else {
      calculateAltAhaScore({
        variables: {
          enrollmentId,
          formDefinitionIdentifier: identifier || '',
          valuesByLinkId: handlers?.getValuesForSubmit().valuesByLinkId || {},
        },
      });
    }
  }, [calculateAltAhaScore, handlers, identifier, onChange]);

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
