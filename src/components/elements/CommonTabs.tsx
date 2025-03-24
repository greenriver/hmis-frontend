import { Box, SxProps, Tab, Tabs } from '@mui/material';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

export type TabDefinition = {
  title: string;
  key: string;
  contents: ReactNode;
};

interface CommonTabsProps {
  tabDefinitions: TabDefinition[];
  ariaLabel: string; // This is a rare case where ariaLabel is a required prop, otherwise the tabs won't be accessible.
  sx?: SxProps;
  currentTab?: string;
  onChangeTab?: (tab: string) => void;
}

// CommonTabs wraps the MUI Tabs component. It can be controlled or uncontrolled,
// so callers can choose whether to delegate controlling the state of which tab is selected.
const CommonTabs: React.FC<CommonTabsProps> = ({
  sx,
  ariaLabel,
  tabDefinitions,
  currentTab,
  onChangeTab,
}) => {
  const { hash } = useLocation();

  // The prop for `currentTab` is a string (key), but internally MUI Tabs uses an number (index).
  // If a hash is already in the url, find the index for that tab and pass it in as the initial value to the useState call.
  const initialIndex = useMemo(() => {
    const initialKey = hash.replace(/^#/, '');
    const index = tabDefinitions.findIndex((t) => t.key === initialKey);

    return Math.max(index, 0); // If we didn't find a tab definition with this key (index === -1), just return 0
  }, [hash, tabDefinitions]);

  const [internalValue, setInternalValue] = useState(initialIndex);

  const currentIndex = useMemo(() => {
    if (!currentTab) return internalValue;
    const index = tabDefinitions.findIndex((t) => t.key === currentTab);

    return Math.max(index, 0);
  }, [currentTab, internalValue, tabDefinitions]);

  const currentKey = useMemo(() => {
    if (currentTab) return currentTab;

    return tabDefinitions[internalValue].key;
  }, [currentTab, internalValue, tabDefinitions]);

  useEffect(() => {
    // If no hash is present on the path, set it to currentKey. (Should be `tabDefinitions[0].key` on pageload)
    if (!hash) {
      window.location.assign(`#${currentKey}`);
    }
  }, [currentKey, hash]);

  const handleChange = (_event: React.SyntheticEvent, newIndex: number) => {
    if (onChangeTab) {
      const newKey = tabDefinitions[newIndex].key;
      onChangeTab(newKey); // Controlled mode: notify parent, passing the key
    } else {
      setInternalValue(newIndex); // Uncontrolled mode: manage internally, using the index
    }
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentIndex}
          onChange={handleChange}
          aria-label={ariaLabel}
        >
          {tabDefinitions.map((t) => (
            <Tab
              key={t.title}
              label={<strong>{t.title}</strong>}
              id={`tab-${t.key}`}
              aria-controls={`tabpanel-${t.key}`}
              href={`#${t.key}`}
              target='_self' // https://github.com/storybookjs/storybook/issues/15934
            />
          ))}
        </Tabs>
      </Box>
      {tabDefinitions.map((t) => (
        <div
          key={t.title}
          role='tabpanel'
          hidden={currentKey !== t.key}
          id={`tabpanel-${t.key}`}
          aria-labelledby={`tab-${t.key}`}
        >
          {currentKey === t.key && <Box mt={3}>{t.contents}</Box>}
        </div>
      ))}
    </Box>
  );
};

export default CommonTabs;
