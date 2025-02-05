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
  disableProceeding?: boolean; // can be used to disable either the onSubmit action, or proceeding to the next tab
  disabledReason?: string;
  // if onSubmit is not provided, the default action is to go to the next tab
  onSubmit?: ButtonProps['onClick'];
  submitButtonText?: string;
  submitLoading?: boolean;
  ButtonProps?: ButtonProps;
};

interface Props extends Omit<CommonDialogProps, 'onSubmit' | 'onClose'> {
  title: string;
  stepDefinitions: StepDefinition[];
  successContent?: ReactNode; // todo @martha success content can be generified into the last step?
  onClose: VoidFunction;
  loading?: boolean;
}

const StepDialog = ({
  title,
  successContent,
  stepDefinitions,
  onClose,
  loading,
  ...rest
}: Props) => {
  const [currentStepKey, setCurrentStepKey] = useState(
    stepDefinitions[0].title
  );

  const currentTabIndex = useMemo(
    () => stepDefinitions.findIndex((t) => t.title === currentStepKey),
    [currentStepKey, stepDefinitions]
  );

  const [prevStep, thisStep, nextStep] = useMemo(() => {
    return [
      stepDefinitions[currentTabIndex - 1],
      stepDefinitions[currentTabIndex],
      stepDefinitions[currentTabIndex + 1],
    ];
  }, [stepDefinitions, currentTabIndex]);

  const {
    title: tabTitle,
    content,
    onSubmit,
    submitButtonText,
    submitLoading,
    disableProceeding,
    disabledReason,
    ButtonProps,
  } = thisStep;

  const nextButton = useMemo(() => {
    if (!onSubmit && !nextStep) return undefined;

    const handleClick = (
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      if (onSubmit) {
        onSubmit(event);
      } else if (nextStep) {
        setCurrentStepKey(nextStep.title);
      }
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
        {!!nextStep && (nextStep.title || 'Next')}
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

  if (!nextButton) return;

  return (
    <CommonDialog onClose={onClose} {...rest}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {loading && <Loading />}
        {/*todo @martha - add horizontal stepper, if easy*/}
        {!loading && !successContent && (
          <>
            <Stack sx={{ mt: 2 }} gap={2}>
              <Box>
                <Typography variant='overline'>
                  Step {currentTabIndex + 1}
                </Typography>
                <Typography variant='h3'>{tabTitle}</Typography>
              </Box>
              {content}
            </Stack>
          </>
        )}
        {successContent && <Box mt={2}>{successContent}</Box>}
      </DialogContent>
      {!successContent && (
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
