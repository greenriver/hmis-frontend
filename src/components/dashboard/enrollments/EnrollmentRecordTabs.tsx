import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Container, Tab } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import AssessmentsPanel from './tabs/AssessmentsPanel';

const tabs = [
  {
    label: 'Assessments',
    Component: AssessmentsPanel,
  },
  {
    label: 'Services',
  },
  {
    label: 'Events',
  },
  {
    label: 'Case Notes',
  },
  {
    label: 'Edit History',
  },
];

const EnrollmentRecordTabs: React.FC = () => {
  const { clientId, enrollmentId } = useParams() as {
    clientId: string;
    enrollmentId: string;
  };
  const [currentTab, setCurrentTab] = useState<string>(tabs[0].label);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    event.preventDefault();
    setCurrentTab(newValue);
  };

  return (
    <TabContext value={currentTab}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList
          onChange={handleChange}
          aria-label='client dashboard tabs'
          indicatorColor='secondary'
          textColor='secondary'
          variant='fullWidth'
        >
          {tabs.map(({ label }) => (
            <Tab
              label={label}
              key={label}
              value={label}
              sx={{
                textTransform: 'capitalize',
                fontWeight: currentTab === label ? 'bold' : undefined,
              }}
            />
          ))}
        </TabList>
      </Box>
      {/* Render inactive tab panels too (as empty divs) for accessibility https://www.w3.org/WAI/ARIA/apg/patterns/tabpanel/#wai-aria-roles-states-and-properties-22 */}
      {tabs.map(({ label, Component }) => (
        <TabPanel value={label} key={label}>
          {label === currentTab && (
            <Container maxWidth='xl'>
              {Component && (
                <Component clientId={clientId} enrollmentId={enrollmentId} />
              )}
            </Container>
          )}
        </TabPanel>
      ))}
    </TabContext>
  );
};

export default EnrollmentRecordTabs;
