import { Box, SxProps, Tab, Tabs } from '@mui/material';
import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type TabDefinition = {
  title: string;
  key: string;
  contents: ReactNode;
};

interface CommonTabsProps {
  tabDefinitions: TabDefinition[];
  ariaLabel: string;
  sx?: SxProps;
  currentTab?: number;
  onChangeTab?: (tab: number) => void;
}

// CommonTabs wraps the MUI Tabs component. It can be controlled or uncontrolled,
// so callers can choose whether to delegate controlling the state of which tab is selected.
// This is a rare case where ariaLabel is a required prop, otherwise the tabs won't be accessible.
const CommonTabs: React.FC<CommonTabsProps> = ({
  sx,
  ariaLabel,
  tabDefinitions,
  currentTab,
  onChangeTab,
}) => {
  const [internalValue, setInternalValue] = useState(0);
  const currentValue = currentTab ?? internalValue;

  const { pathname, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hash) {
      navigate(`${pathname}#${tabDefinitions[currentValue].key}`, {
        replace: true,
      });
    }
  }, [currentValue, hash, navigate, pathname, tabDefinitions]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (onChangeTab) {
      onChangeTab(newValue); // Controlled mode: notify parent
    } else {
      setInternalValue(newValue); // Uncontrolled mode: manage internally
    }
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentValue}
          onChange={handleChange}
          aria-label={ariaLabel}
        >
          {tabDefinitions.map((t, i) => (
            <Tab
              key={t.title}
              label={<strong>{t.title}</strong>}
              id={`tab-${i}`}
              aria-controls={`tabpanel-${i}`}
              href={`#${t.key}`}
              target='_self' // https://github.com/storybookjs/storybook/issues/15934
            />
          ))}
        </Tabs>
      </Box>
      {tabDefinitions.map((t, i) => (
        <div
          key={t.title}
          role='tabpanel'
          hidden={currentValue !== i}
          id={`tabpanel-${i}`}
          aria-labelledby={`tab-${i}`}
        >
          {currentValue === i && <Box mt={3}>{t.contents}</Box>}
        </div>
      ))}
    </Box>
  );
};

export default CommonTabs;
