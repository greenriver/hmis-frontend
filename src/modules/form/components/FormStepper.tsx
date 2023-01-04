import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Step, StepLabel, Stepper } from '@mui/material';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import RouterLink from '@/components/elements/RouterLink';
import { FormItem } from '@/types/gqlTypes';

export interface Props {
  items: FormItem[];
}
const FormStepper = ({ items }: Props) => {
  const { pathname } = useLocation();
  const steps = useMemo(
    () =>
      items
        .filter((i) => !i.hidden)
        .map((i) => ({
          label: i.text,
          linkId: i.linkId,
        })),
    [items]
  );

  return (
    <Stepper activeStep={0} orientation='vertical' nonLinear>
      {steps.map((step) => (
        <Step key={step.linkId}>
          <StepLabel
            StepIconComponent={RadioButtonUncheckedIcon}
            StepIconProps={{
              color: 'disabled',
              error: undefined,
              active: undefined,
              completed: undefined,
            }}
            sx={{ py: 0 }}
          >
            <RouterLink
              to={`${pathname}#${step.linkId}`}
              data-testid={`formNavTo-${step.linkId}`}
            >
              {step.label}
            </RouterLink>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default FormStepper;
