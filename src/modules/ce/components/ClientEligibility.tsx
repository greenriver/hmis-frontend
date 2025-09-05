import { Stack, Typography } from '@mui/material';
import MutationButtonField from '@/modules/form/components/MutationButtonField';
import { FormDefinitionHandlers } from '@/modules/form/hooks/useFormDefinitionHandlers';
import { DynamicInputCommonProps } from '@/modules/form/types';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import {
  PickListOption,
  useCalculateClientEligibilityMutation,
} from '@/types/gqlTypes';

const projectTypePickList = localResolvePickList('ProjectType');

interface ClientEligibilityProps extends DynamicInputCommonProps {
  value?: PickListOption[] | null;
  onChange?: (value: PickListOption[] | null) => void;
  handlers?: FormDefinitionHandlers;
}

// Shows a button to calculate client eligibility based on current form values, and displays the result.
const ClientEligibility = ({
  value,
  onChange,
  label,
  disabled = false,
  handlers,
}: ClientEligibilityProps) => {
  const handleMutationCompleted = (
    resultData: any,
    onChange?: (value: PickListOption[] | null) => void
  ) => {
    if (onChange && resultData) {
      const eligibleProjectTypes = resultData.projectTypes;

      // Convert the returned project type codes to their corresponding pick list options.
      const matchingPickListOptions = eligibleProjectTypes
        .map((projectTypeCode: string) =>
          projectTypePickList?.find(
            (pickListOption) => pickListOption.code === projectTypeCode
          )
        )
        // Filter out undefined values to keep typescript happy
        .filter((option: PickListOption | undefined): option is PickListOption => option !== undefined);

      onChange(matchingPickListOptions);
    }
  };

  return (
    <MutationButtonField
      value={value}
      onChange={onChange}
      label={label}
      disabled={disabled}
      handlers={handlers}
      buttonText="Calculate Client Eligibility"
      dataPath="calculateClientEligibility"
      useMutation={useCalculateClientEligibilityMutation}
      onMutationCompleted={handleMutationCompleted}
    >
      {value && value.length > 0 && (
        <Stack direction='column' gap={0.5}>
          {value.map((projectType) => (
            <Typography key={projectType.code} variant='body2'>
              {projectType.label}
            </Typography>
          ))}
        </Stack>
      )}

      {value && value.length === 0 && (
        <Typography
          variant='body2'
          sx={{ fontStyle: 'italic', color: 'text.secondary' }}
        >
          No eligible project types found
        </Typography>
      )}
    </MutationButtonField>
  );
};

export default ClientEligibility;
