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
          anchor: i.linkId,
          testId: `formNavTo-${i.linkId}`,
        })),
    [items]
  );

  const handleClick = useCallback(
    (anchor: string) => {
      const element = document.getElementById(anchor);
      scrollToElement(element, scrollOffset);
    },
    [scrollOffset]
  );

  return (
    <Stepper activeStep={0} orientation='vertical' nonLinear>
      {steps.map((step) => (
        <Step key={step.anchor}>
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
                to={`${pathname}#${step.anchor}`}
                replace
                data-testid={step.testId}
              >
                {step.label}
              </RouterLink>
            ) : (
              <StepButton
                data-testid={step.testId}
                onClick={() => handleClick(step.anchor)}
                sx={{
                  '.MuiStepLabel-root': { py: 0 },
                  '.MuiStepLabel-iconContainer': { display: 'none' },
                  '.MuiStepLabel-label': {
                    color: '#1976d2',
                    textDecoration: 'underline',
                    textDecorationColor: 'rgba(25, 118, 210, 0.4)',
                  },
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
