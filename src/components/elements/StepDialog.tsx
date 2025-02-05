import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  ButtonProps,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowLeftIcon, ArrowRightIcon } from '@mui/x-date-pickers';
import React, { ReactNode, useMemo, useState } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import CommonDialog, {
  CommonDialogProps,
} from '@/components/elements/CommonDialog';
import Loading from '@/components/elements/Loading';

export type StepDefinition = {
  title: string;
  content: ReactNode;
  disableProceeding?: boolean; // can be used to disable either the onSubmit action, or proceeding to the next step
  disabledReason?: string;
  // if onSubmit is not provided, the default action is to go to the next step
  onSubmit?: () => Promise<any>;
  submitButtonText?: string;
  submitLoading?: boolean;
  ButtonProps?: ButtonProps;
  omitStepTitle?: boolean;
};

interface Props extends Omit<CommonDialogProps, 'onSubmit' | 'onClose'> {
  title: string;
  stepDefinitions: StepDefinition[];
  onClose: VoidFunction;
  loading?: boolean;
}

const StepDialog = ({
  title,
  stepDefinitions,
  onClose,
  loading,
  ...rest
}: Props) => {
  const [currentStepKey, setCurrentStepKey] = useState(
    stepDefinitions[0].title
  );

  const currentStepIndex = useMemo(
    () => stepDefinitions.findIndex((t) => t.title === currentStepKey),
    [currentStepKey, stepDefinitions]
  );

  const [prevStep, thisStep, nextStep] = useMemo(() => {
    return [
      stepDefinitions[currentStepIndex - 1],
      stepDefinitions[currentStepIndex],
      stepDefinitions[currentStepIndex + 1],
    ];
  }, [stepDefinitions, currentStepIndex]);

  const {
    title: stepTitle,
    content,
    onSubmit,
    submitButtonText,
    submitLoading,
    disableProceeding,
    disabledReason,
    ButtonProps,
    omitStepTitle,
  } = thisStep;

  const nextButton = useMemo(() => {
    if (!onSubmit && !nextStep) return undefined;

    const handleClick = async () => {
      if (onSubmit) await onSubmit();
      if (nextStep) setCurrentStepKey(nextStep.title);
    };

    return (
      <LoadingButton
        onClick={handleClick}
        type={!!onSubmit ? 'submit' : 'button'}
        loading={submitLoading}
        sx={{ minWidth: '120px' }}
        disabled={disableProceeding}
        endIcon={nextStep ? <ArrowRightIcon /> : undefined}
        {...ButtonProps}
      >
        {!!onSubmit && (submitButtonText || 'Submit')}
        {!onSubmit && !!nextStep && (nextStep.title || 'Next')}
      </LoadingButton>
    );
  }, [
    ButtonProps,
    disableProceeding,
    nextStep,
    onSubmit,
    submitButtonText,
    submitLoading,
  ]);

  return (
    <CommonDialog onClose={onClose} {...rest}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Loading />
        ) : (
          <Stack sx={{ mt: 2 }} gap={2}>
            {!omitStepTitle && (
              <Box>
                <Typography variant='overline'>
                  Step {currentStepIndex + 1}
                </Typography>
                <Typography variant='h3'>{stepTitle}</Typography>
              </Box>
            )}
            {content}
          </Stack>
        )}
      </DialogContent>
      {!!nextButton && (
        <DialogActions>
          <Stack
            direction='row'
            justifyContent={'space-between'}
            sx={{ width: '100%' }}
          >
            <Box flexGrow={1}>
              {prevStep && (
                <Button
                  startIcon={<ArrowLeftIcon />}
                  color='grayscale'
                  onClick={() => setCurrentStepKey(prevStep.title)}
                >
                  Back
                </Button>
              )}
            </Box>

            <Stack gap={3} direction='row'>
              <Button onClick={onClose} color='grayscale'>
                Cancel
              </Button>

              {disableProceeding && disabledReason ? (
                <ButtonTooltipContainer
                  title={disabledReason}
                  placement='top-start'
                >
                  {nextButton}
                </ButtonTooltipContainer>
              ) : (
                nextButton
              )}
            </Stack>
          </Stack>
        </DialogActions>
      )}
    </CommonDialog>
  );
};

export default StepDialog;
