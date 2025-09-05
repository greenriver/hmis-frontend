import { Typography } from '@mui/material';
import LabelWithContent from '@/components/elements/LabelWithContent';
import MutationButtonField from '@/modules/form/components/MutationButtonField';
import { FormDefinitionHandlers } from '@/modules/form/hooks/useFormDefinitionHandlers';
import { DynamicInputCommonProps } from '@/modules/form/types';
import { useCalculateAltAhaScoreMutation } from '@/types/gqlTypes';

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
  const handleMutationCompleted = (
    resultData: any,
    onChange?: (value: number | null) => void
  ) => {
    if (onChange && resultData) {
      onChange(resultData.score || null);
    }
  };

  return (
    <MutationButtonField
      value={value}
      onChange={onChange}
      label={label}
      disabled={disabled}
      handlers={handlers}
      buttonText="Calculate Alt-AHA Score"
      dataPath="calculateAltAhaScore"
      useMutation={useCalculateAltAhaScoreMutation}
      onMutationCompleted={handleMutationCompleted}
    >
      {(value !== null && value !== undefined) && (
        <LabelWithContent label='Alt-AHA Score'>
          <Typography variant='body2'>{value}</Typography>
        </LabelWithContent>
      )}
    </MutationButtonField>
  );
};

export default AltAhaScore;
