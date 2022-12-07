import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Step, StepLabel, Stepper } from '@mui/material';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import RouterLink from '@/components/elements/RouterLink';
import { FormDefinitionJson } from '@/types/gqlTypes';

export interface Props {
  definition: FormDefinitionJson;
}
const FormStepper = ({ definition }: Props) => {
  const { pathname } = useLocation();
  const steps = useMemo(
    () =>
      (definition.item || [])
        .filter((i) => !i.hidden)
        .map((i) => ({
          label: i.text,
          linkId: i.linkId,
        })),
    [definition]
  );

  return (
    <Stepper activeStep={0} orientation='vertical' nonLinear>
      {steps.map((step) => (
        <Step key={step.linkId}>
          <StepLabel
            StepIconComponent={RadioButtonUncheckedIcon}
            StepIconProps={{ color: 'disabled' }}
            sx={{ py: 0 }}
          >
            <RouterLink to={`${pathname}#${step.linkId}`}>
              {step.label}
            </RouterLink>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default FormStepper;
