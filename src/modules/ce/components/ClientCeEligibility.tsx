import { Stack, Typography } from '@mui/material';
import { useCallback, useContext, useState } from 'react';
import LoadingButton from '@/components/elements/LoadingButton';
import AssessmentContext from '@/modules/assessments/components/AssessmentContext';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { emptyErrorState, ErrorState, hasErrors } from '@/modules/errors/util';
import { FormDefinitionHandlers } from '@/modules/form/hooks/useFormDefinitionHandlers';
import { DynamicInputCommonProps } from '@/modules/form/types';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import {
  CalculateClientCeEligibilityMutation,
  PickListOption,
  useCalculateClientCeEligibilityMutation,
} from '@/types/gqlTypes';

const projectTypePickList = localResolvePickList('ProjectType');

interface ClientEligibilityProps extends DynamicInputCommonProps {
  value?: PickListOption[] | null;
  onChange?: (value: PickListOption[] | null) => void;
  handlers?: FormDefinitionHandlers;
}

// Shows a button to calculate client eligibility based on current form values, and displays the result.
const ClientCeEligibility = ({
  value,
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

          // Convert the returned project type codes to their corresponding pick list options.
          // Filter out undefined values to keep typescript happy
          const matchingPickListOptions = eligibleProjectTypes
            .map((projectTypeCode) =>
              projectTypePickList?.find(
                (pickListOption) => pickListOption.code === projectTypeCode
              )
            )
            .filter((option): option is PickListOption => option !== undefined);

          onChange(matchingPickListOptions);
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
      calculateClientEligibility({
        variables: {
          enrollmentId,
          formDefinitionIdentifier: formDefinitionIdentifier,
          valuesByLinkId: handlers?.getValuesForSubmit().valuesByLinkId || {},
        },
      });
    }
  }, [
    hasRequiredContext,
    calculateClientEligibility,
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
        Calculate Client Eligibility
      </LoadingButton>

      {value && value.length > 0 && (
        <Stack direction='column' gap={0.5}>
          {value.map((projectType) => (
            <Typography key={projectType.code} variant='body2'>
              {projectType.label}
            </Typography>
          ))}
        </Stack>
      )}

    </Stack>
  );
};

export default ClientCeEligibility;
