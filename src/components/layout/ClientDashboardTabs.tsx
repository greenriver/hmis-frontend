import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import { Container } from '@mui/system';
import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface Props {
  tabs: { label: string; key: string; render: () => React.ReactNode }[];
}
const DashboardTabs: React.FC<Props> = ({ tabs }) => {
  const location = useLocation();
  const navigate = useNavigate();

  let initial = tabs[0].key;
  if (location.hash) {
    const hash = location.hash.replace('#', '');
    if (tabs.find(({ key }) => key === hash)) {
      initial = hash;
    }
  }
  const [value, setValue] = React.useState<string>(initial);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    event.preventDefault();
    navigate(`#${newValue}`);
    setValue(newValue);
  };

  const activeTab = tabs.find(({ key }) => key === value);
  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList
            onChange={handleChange}
            aria-label='client dashboard tabs'
            indicatorColor='secondary'
            textColor='secondary'
            variant='fullWidth'
          >
            {tabs.map(({ label, key }) => (
              <Tab
                label={label}
                key={key}
                value={key}
                component={Link}
                to={`/`}
                sx={{
                  textTransform: 'capitalize',
                  fontWeight: value === key ? 'bold' : undefined,
                }}
              />
            ))}
          </TabList>
        </Box>
        <Container maxWidth='xl'>
          {activeTab && <TabPanel value={value}>{activeTab.render()}</TabPanel>}
        </Container>
      </TabContext>
    </Box>
  );
};
export default DashboardTabs;
