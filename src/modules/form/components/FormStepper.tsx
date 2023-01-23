import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Step, StepButton, StepLabel, Stepper } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import RouterLink from '@/components/elements/RouterLink';
import { scrollToElement } from '@/hooks/useScrollToHash';
import { FormItem } from '@/types/gqlTypes';

export interface Props {
  items: FormItem[];
  useUrlHash?: boolean;
  scrollOffset?: number;
}
const FormStepper = ({ items, useUrlHash = true, scrollOffset }: Props) => {
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

  const handleClick = useCallback(
    (linkId: string) => {
      const element = document.getElementById(linkId);
      scrollToElement(element, scrollOffset);
    },
    [scrollOffset]
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
            {useUrlHash ? (
              <RouterLink
                to={`${pathname}#${step.linkId}`}
                data-testid={`formNavTo-${step.linkId}`}
              >
                {step.label}
              </RouterLink>
            ) : (
              <StepButton
                data-testid={`formNavTo-${step.linkId}`}
                onClick={() => handleClick(step.linkId)}
                sx={{
                  '.MuiStepLabel-root': { py: 0 },
                  '.MuiStepLabel-iconContainer': { display: 'none' },
                  '.MuiStepLabel-labelContainer': { color: 'text.primary' },
                }}
              >
                {step.label}
              </StepButton>
            )}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default FormStepper;
