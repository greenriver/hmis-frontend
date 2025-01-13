import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
} from '@mui/material';
import { ReactNode, SyntheticEvent, useCallback, useState } from 'react';
import CommonDialog, {
  CommonDialogProps,
} from '@/components/elements/CommonDialog';
import FormDialogActionContent from '@/modules/form/components/FormDialogActionContent';

type TabDefinition = {
  title: string;
  content: ReactNode;
};

interface Props extends Omit<CommonDialogProps, 'onSubmit' | 'onClose'> {
  title: string;
  tabDefinitions: TabDefinition[];
  onSubmit: VoidFunction;
  onClose: VoidFunction;
}

const StepDialog = ({
  title,
  tabDefinitions,
  onSubmit,
  onClose,
  ...rest
}: Props) => {
  const [tabValue, setTabValue] = useState(tabDefinitions[0].title);

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleSubmit = useCallback(() => {
    const currentTabIndex = tabDefinitions.findIndex(
      (td: TabDefinition) => td.title === tabValue
    );
    if (currentTabIndex === tabDefinitions.length - 1) {
      onSubmit?.();
    } else {
      const nextTabValue = tabDefinitions[currentTabIndex + 1].title;
      setTabValue(nextTabValue);
    }
  }, [onSubmit, tabDefinitions, tabValue]);

  return (
    <CommonDialog {...rest}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label='dialog tabs'>
              {/*  todo @martha aria label*/}
              {tabDefinitions.map((tab: TabDefinition) => (
                <Tab label={tab.title} value={tab.title} />
              ))}
            </TabList>
          </Box>
          {tabDefinitions.map((tab: TabDefinition) => (
            <TabPanel value={tab.title}>{tab.content}</TabPanel>
          ))}
        </TabContext>
      </DialogContent>
      <DialogActions>
        <FormDialogActionContent
          onSubmit={handleSubmit}
          submitButtonText={'Next'} // todo @martha - add specific text
          onDiscard={onClose}
          // todo @martha - add a back button
        />
      </DialogActions>
    </CommonDialog>
  );
};

export default StepDialog;
