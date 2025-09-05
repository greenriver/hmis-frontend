import { Stack } from '@mui/material';
import { useCallback, useContext, useState } from 'react';
import LoadingButton from '@/components/elements/LoadingButton';
import AssessmentContext from '@/modules/assessments/components/AssessmentContext';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { emptyErrorState, ErrorState, hasErrors } from '@/modules/errors/util';
import { FormDefinitionHandlers } from '@/modules/form/hooks/useFormDefinitionHandlers';
import { DynamicInputCommonProps } from '@/modules/form/types';

interface MutationButtonFieldProps<TData, TValue> extends DynamicInputCommonProps {
  value?: TValue;
  onChange?: (value: TValue) => void;
  handlers?: FormDefinitionHandlers;
  buttonText: string;
  dataPath: string;
  useMutation: () => [
    (options: { variables: any; onCompleted?: (data: TData) => void; onError?: (error: any) => void }) => void,
    { loading: boolean }
  ];
  onMutationCompleted: (resultData: any, onChange?: (value: TValue) => void) => void;
  children?: React.ReactNode;
}

/**
 * Generic form field component for mutations that trigger from a button.
 * Handles common patterns like error states, loading states, and assessment context.
 * Uses dataPath to extract result data and errors from the mutation response.
 */
const MutationButtonField = <TData, TValue>({
  value,
  onChange,
  label,
  disabled = false,
  handlers,
  buttonText,
  dataPath,
  useMutation,
  onMutationCompleted,
  children,
}: MutationButtonFieldProps<TData, TValue>) => {
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  const [executeMutation, { loading }] = useMutation();

  const { formDefinitionIdentifier, enrollmentId } =
    useContext(AssessmentContext) || {};

  const hasRequiredContext = !!enrollmentId && !!formDefinitionIdentifier;

  const handleExecute = useCallback(() => {
    if (hasRequiredContext) {
      executeMutation({
        variables: {
          enrollmentId,
          formDefinitionIdentifier: formDefinitionIdentifier,
          valuesByLinkId: handlers?.getValuesForSubmit().valuesByLinkId || {},
        },
        onCompleted: (data: TData) => {
          // Extract the result data using the provided path
          const resultData = (data as any)[dataPath];
          
          // Handle common error checking pattern
          const errors = resultData?.errors || [];
          if (errors.length > 0) {
            setErrorState({ ...emptyErrorState, errors });
            return;
          }

          // Clear error state on success
          setErrorState(emptyErrorState);

          // Call the component-specific mutation completed handler
          onMutationCompleted(resultData, onChange);
        },
        onError: (apolloError: any) => {
          setErrorState({ ...emptyErrorState, apolloError });
        },
      });
    }
  }, [
    hasRequiredContext,
    executeMutation,
    enrollmentId,
    formDefinitionIdentifier,
    handlers,
    dataPath,
    onMutationCompleted,
    onChange,
  ]);

  return (
    <Stack direction='column' gap={1} alignItems='flex-start'>
      {label}
      {errorState && hasErrors(errorState) && (
        <Stack gap={1} sx={{ mb: 1 }}>
          <ApolloErrorAlert error={errorState.apolloError} inline />
          <ErrorAlert fixable errors={errorState.errors} />
        </Stack>
      )}
      <LoadingButton
        loading={loading}
        // Disable the button if the disabled prop is passed down from the form item,
        // or if the form is being rendered outside of an assessment context (e.g. in the form preview)
        disabled={disabled || !hasRequiredContext}
        type='button'
        onClick={handleExecute}
        sx={{ my: 1 }}
      >
        {buttonText}
      </LoadingButton>

      {children}
    </Stack>
  );
};

export default MutationButtonField;
