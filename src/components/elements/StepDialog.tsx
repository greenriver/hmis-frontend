import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Box,
  Button,
  ButtonProps,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
} from '@mui/material';
import { ArrowLeftIcon, ArrowRightIcon } from '@mui/x-date-pickers';
import {
  ReactNode,
  SyntheticEvent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import CommonDialog, {
  CommonDialogProps,
} from '@/components/elements/CommonDialog';
import Loading from '@/components/elements/Loading';
import FormDialogActionContent, {
  FormDialogActionProps,
} from '@/modules/form/components/FormDialogActionContent';

export type TabDefinition = {
  title: string;
  content: ReactNode;
  FormDialogActionProps?: Partial<FormDialogActionProps>;
  disableSubmit?: boolean;
};

interface Props extends Omit<CommonDialogProps, 'onSubmit' | 'onClose'> {
  title: string;
  tabDefinitions: TabDefinition[];
  submitButtonTitle?: string;
  SubmitButtonProps?: ButtonProps;
  successContent?: ReactNode;
  onSubmit: VoidFunction;
  onClose: VoidFunction;
  loading?: boolean;
}

const StepDialog = ({
  title,
  submitButtonTitle,
  SubmitButtonProps,
  successContent,
  tabDefinitions,
  onSubmit,
  onClose,
  loading,
  ...rest
}: Props) => {
  const [tabValue, setTabValue] = useState(tabDefinitions[0].title);

  const handleChange = useCallback(
    (event: SyntheticEvent, newValue: string) => {
      setTabValue(newValue);
    },
    []
  );

  const [previousTab, currentTab, nextTab] = useMemo(() => {
    const currentTabIndex = tabDefinitions.findIndex(
      (t) => t.title === tabValue
    );

    return [
      tabDefinitions[currentTabIndex - 1],
      tabDefinitions[currentTabIndex],
      tabDefinitions[currentTabIndex + 1],
    ];
  }, [tabDefinitions, tabValue]);

  const handleSubmit = useCallback(() => {
    if (nextTab) {
      setTabValue(nextTab.title);
    } else {
      onSubmit();
    }
  }, [nextTab, onSubmit]);

  return (
    <CommonDialog onClose={onClose} {...rest}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {loading && <Loading />}
        {!loading && !successContent && (
          <TabContext value={tabValue}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleChange} aria-label={`${title} steps`}>
                {tabDefinitions.map((tab: TabDefinition) => (
                  <Tab key={tab.title} label={tab.title} value={tab.title} />
                ))}
              </TabList>
            </Box>
            {tabDefinitions.map((tab: TabDefinition) => (
              <TabPanel key={tab.title} value={tab.title}>
                {tab.content}
              </TabPanel>
            ))}
          </TabContext>
        )}
        {successContent && <Box mt={2}>{successContent}</Box>}
      </DialogContent>
      {!successContent && (
        <DialogActions>
          <FormDialogActionContent
            onSubmit={handleSubmit}
            submitButtonText={nextTab?.title || submitButtonTitle}
            PrimaryActionProps={
              !!nextTab ? { endIcon: <ArrowRightIcon /> } : SubmitButtonProps
            }
            onDiscard={onClose}
            otherActions={
              previousTab && (
                <Button
                  startIcon={<ArrowLeftIcon />}
                  color='grayscale'
                  onClick={() => setTabValue(previousTab.title)}
                >
                  Back
                </Button>
              )
            }
            {...currentTab.FormDialogActionProps}
          />
        </DialogActions>
      )}
    </CommonDialog>
  );
};

export default StepDialog;
