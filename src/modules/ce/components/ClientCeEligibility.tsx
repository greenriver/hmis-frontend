import { Stack } from '@mui/material';
import { useCallback, useContext, useState } from 'react';
import LoadingButton from '@/components/elements/LoadingButton';
import AssessmentContext from '@/modules/assessments/components/AssessmentContext';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { emptyErrorState, ErrorState, hasErrors } from '@/modules/errors/util';
import { FormDefinitionHandlers } from '@/modules/form/hooks/useFormDefinitionHandlers';
import { DynamicInputCommonProps } from '@/modules/form/types';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CalculateClientCeEligibilityMutation,
  PickListOption,
  useCalculateClientCeEligibilityMutation,
} from '@/types/gqlTypes';

interface ClientEligibilityProps extends DynamicInputCommonProps {
  value?: PickListOption[] | null; // array of PickListOptions representing Project Types that this client is eligible for
  onChange?: (value: PickListOption[] | null) => void;
  handlers: FormDefinitionHandlers;
}

// Shows a button to calculate client eligibility based on current form values, and displays the result.
const ClientCeEligibility = ({
  onChange,
  label,
  disabled = false,
  handlers,
}: ClientEligibilityProps) => {
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  const [calculateClientEligibility, { loading }] =
    useCalculateClientCeEligibilityMutation({
      onCompleted: (data: CalculateClientCeEligibilityMutation) => {
        const errors = data.calculateClientCeEligibility?.errors || [];
        if (errors.length > 0) {
          setErrorState({ ...emptyErrorState, errors });
          return;
        }

        setErrorState(emptyErrorState);

        if (onChange && data.calculateClientCeEligibility?.projectTypes) {
          const eligibleProjectTypes =
            data.calculateClientCeEligibility.projectTypes;

          // Convert the returned project type codes to pick list options, because
          // this is the expected format for form items collecting multiple Pick List values.
          // See formValueToGqlValue
          const eligibleProjectTypesAsPickList = eligibleProjectTypes.map(
            (code) => ({ code, label: HmisEnums.ProjectType[code] })
          );
          onChange(eligibleProjectTypesAsPickList);
        }
      },
      onError: (apolloError) => {
        setErrorState({ ...emptyErrorState, apolloError });
      },
    });

  const { formDefinitionIdentifier, enrollmentId } =
    useContext(AssessmentContext) || {};

  const hasRequiredContext = !!enrollmentId && !!formDefinitionIdentifier;
  const { getValuesForSubmit } = handlers;

  const handleFetch = useCallback(() => {
    if (hasRequiredContext) {
      calculateClientEligibility({
        variables: {
          enrollmentId,
          formDefinitionIdentifier: formDefinitionIdentifier,
          valuesByLinkId: getValuesForSubmit().valuesByLinkId,
        },
      });
    }
  }, [
    hasRequiredContext,
    calculateClientEligibility,
    enrollmentId,
    formDefinitionIdentifier,
    getValuesForSubmit,
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
        Calculate Client Eligibility
      </LoadingButton>
    </Stack>
  );
};

export default ClientCeEligibility;
