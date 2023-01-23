import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab } from '@mui/material';
import { useState } from 'react';

import AssessmentsTable from './tabs/AssessmentsTable';
import EventsTable from './tabs/EventsTable';
import ServicesTable from './tabs/ServicesTable';

import useSafeParams from '@/hooks/useSafeParams';
import { EnrollmentFieldsFragment } from '@/types/gqlTypes';

const tabs = [
  {
    key: 'assessments',
    label: 'Assessments',
    Component: AssessmentsTable,
  },
  {
    key: 'services',
    label: 'Services',
    Component: ServicesTable,
  },
  {
    key: 'events',
    label: 'CE Events',
    Component: EventsTable,
  },
  {
    key: 'notes',
    label: 'Case Notes',
  },
  {
    key: 'history',
    label: 'Edit History',
  },
];

const EnrollmentRecordTabs = ({
  enrollment,
}: {
  enrollment: EnrollmentFieldsFragment;
}) => {
  const { clientId, enrollmentId } = useSafeParams() as {
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
      {tabs.map(({ key, label, Component }) => (
        <TabPanel
          value={label}
          key={key}
          sx={{ pt: 1, pb: 1, px: 0, mx: 0, h5: { ml: 3 } }}
          data-testid={`panel-${key}`}
        >
          {label === currentTab && Component && (
            <Component
              clientId={clientId}
              enrollmentId={enrollmentId}
              enrollment={enrollment}
            />
          )}
        </TabPanel>
      ))}
    </TabContext>
  );
};

export default EnrollmentRecordTabs;
