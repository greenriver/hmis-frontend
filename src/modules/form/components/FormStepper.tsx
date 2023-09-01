import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import CheckIcon from '@mui/icons-material/Check';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
  Box,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  SvgIconProps,
  Typography,
  useTheme,
} from '@mui/material';
import { isEmpty } from 'lodash-es';
import pluralize from 'pluralize';
import { ComponentType, useCallback, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { FormStepperStateContext } from '../hooks/useFormStepperContext';
import RouterLink from '@/components/elements/RouterLink';
import { scrollToElement } from '@/hooks/useScrollToHash';
import { FormItem } from '@/types/gqlTypes';

export interface Props {
  items: FormItem[];
  useUrlHash?: boolean;
  scrollOffset?: number;
}

export const getNavItems = (items: FormItem[]) =>
  items
    .filter((i) => !i.hidden)
    .map((i) => ({
      label: i.text,
      anchor: i.linkId,
      testId: `formNavTo-${i.linkId}`,
    }));

const StyledStepIcon = ({
  IconComponent = RadioButtonUncheckedIcon,
  color,
  bgColor,
  hidden = false,
}: {
  IconComponent?: ComponentType<SvgIconProps>;
  color: string;
  bgColor: string;
  hidden?: boolean;
}) => {
  return (
    <Box
      sx={{
        padding: '4px',
        border: `1px solid ${color}`,
        backgroundColor: bgColor,
        borderRadius: '100px',
        lineHeight: 0,
        my: 0.5,
        ml: 0.4,
        fontSize: 12,
      }}
    >
      <IconComponent
        fontSize='inherit'
        sx={{ color, visibility: hidden ? 'hidden' : undefined }}
      />
    </Box>
  );
};

const UnsavedChangesIcon = () => {
  const theme = useTheme();
  return (
    <StyledStepIcon
      IconComponent={ChangeHistoryIcon}
      color={theme.palette.stepper.changed.color}
      bgColor={theme.palette.stepper.changed.background}
    />
  );
};

const ErrorIcon = () => {
  const theme = useTheme();
  return (
    <StyledStepIcon
      IconComponent={PriorityHighIcon}
      color={theme.palette.stepper.error.color}
      bgColor={theme.palette.stepper.error.background}
    />
  );
};

const WarningIcon = () => {
  const theme = useTheme();
  return (
    <StyledStepIcon
      IconComponent={PriorityHighIcon}
      color={theme.palette.stepper.warning.color}
      bgColor={theme.palette.stepper.warning.background}
    />
  );
};

const EmptyIcon = () => {
  const theme = useTheme();
  return (
    <StyledStepIcon
      hidden
      color={theme.palette.stepper.empty.color}
      bgColor={theme.palette.stepper.empty.background}
    />
  );
};

const CompleteIcon = () => {
  const theme = useTheme();
  return (
    <StyledStepIcon
      IconComponent={CheckIcon}
      color={theme.palette.stepper.complete.color}
      bgColor={theme.palette.stepper.complete.background}
    />
  );
};

const FormStepper = ({ items, useUrlHash = true, scrollOffset }: Props) => {
  const { pathname } = useLocation();
  const steps = useMemo(() => getNavItems(items), [items]);

  const stepperState = useContext(FormStepperStateContext);

  const handleClick = useCallback(
    (anchor: string) => {
      const element = document.getElementById(anchor);
      scrollToElement(element, scrollOffset);
    },
    [scrollOffset]
  );

  return (
    // Set to 10000 so that no steps have the active treatment
    <Stepper activeStep={10000} orientation='vertical' nonLinear>
      {steps.map((step) => {
        const changes = stepperState[step.anchor]?.changed || [];
        const errors = stepperState[step.anchor]?.errors?.errors || [];
        const warnings = stepperState[step.anchor]?.errors?.warnings || [];

        let StepIconComponent: ComponentType<SvgIconProps> = EmptyIcon;
        let stepText = '';

        if (!isEmpty(warnings)) {
          StepIconComponent = WarningIcon;
          stepText = `${warnings.length} ${pluralize(
            'warning',
            warnings.length
          )}`;
        }
        if (!isEmpty(errors)) {
          StepIconComponent = ErrorIcon;
          stepText = `${errors.length} ${pluralize('error', errors.length)}`;
        }
        if (stepperState[step.anchor]?.complete) {
          StepIconComponent = CompleteIcon;
          stepText = '';
        }
        if (!isEmpty(changes)) {
          StepIconComponent = UnsavedChangesIcon;
          stepText = `${changes.length} ${pluralize('change', changes.length)}`;
        }

        return (
          <Step key={step.anchor}>
            <StepLabel
              StepIconComponent={StepIconComponent}
              StepIconProps={{
                error: undefined,
                active: undefined,
                completed: undefined,
              }}
              sx={{ py: 0 }}
            >
              {useUrlHash ? (
                <RouterLink
                  to={`${pathname}#${step.anchor}`}
                  data-testid={step.testId}
                  plain
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
              {stepText && (
                <Typography fontSize='0.8rem'>{stepText}</Typography>
              )}
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};

export default FormStepper;
