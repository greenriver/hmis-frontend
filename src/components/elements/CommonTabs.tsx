import { Box, SxProps, Tab, Tabs } from '@mui/material';
import React, { ReactNode, useMemo } from 'react';
import NotFound from '@/components/pages/NotFound';
import useHashState from '@/hooks/useHashState.ts';

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
  collapseSingleTab?: boolean; // If true (default), and there is only one tab definition, the tab interface is hidden, and the tab's content is shown with no wrapper
}

// CommonTabs wraps the MUI Tabs component. It can be controlled or uncontrolled.
// If uncontrolled, it stores state using hash params.
// If controlled, the parent is responsible for managing the state (see UserAuditPage for example).
// Managing state internally *without* hash params is currently not supported, but we can add this if the need arises.
const CommonTabs: React.FC<CommonTabsProps> = ({
  sx,
  ariaLabel,
  tabDefinitions,
  currentTab,
  onChangeTab,
  collapseSingleTab = true,
}) => {
  const [internalValue, setInternalValue] = useHashState({
    initial: tabDefinitions[0].key,
    skip: !!onChangeTab,
    clearSearch: true,
  });

  const currentKey = useMemo(() => {
    if (currentTab) return currentTab;

    return internalValue;
  }, [currentTab, internalValue]);

  const currentIndex = useMemo(() => {
    const index = tabDefinitions.findIndex((t) => t.key === currentKey);

    return Math.max(index, 0); // If we didn't find a tab definition with this key (index === -1), just return 0
  }, [currentKey, tabDefinitions]);

  const handleChange = (_event: React.SyntheticEvent, newIndex: number) => {
    const newKey = tabDefinitions[newIndex].key;
    if (onChangeTab) {
      onChangeTab(newKey); // Controlled mode: notify parent, passing the key
    } else {
      setInternalValue(newKey); // Uncontrolled mode: manage internally
    }
  };

  if (tabDefinitions.length === 0) return <NotFound />;

  if (collapseSingleTab && tabDefinitions.length === 1) {
    return tabDefinitions[0].contents;
  }

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
              {...(onChangeTab
                ? {}
                : // _self mitigates an open bug with Storybook; see https://github.com/storybookjs/storybook/issues/15934
                  { href: `#${t.key}`, target: '_self' })}
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
