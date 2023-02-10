import { ThemeProvider } from '@mui/material';
import React, { PropsWithChildren, useEffect } from 'react';

import useMergedTheme from './useMergedTheme';
import { fetchThemes } from './utils';

import useLocalStorage from '@/hooks/useLocalStorage';

const MergedThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [remoteThemeId, setRemoteThemeId] = useLocalStorage<string>(
    'remoteThemeId',
    import.meta.env.PUBLIC_DEFAULT_THEME
  );
  const theme = useMergedTheme(remoteThemeId);

  useEffect(() => {
    if (import.meta.env.PUBLIC_ALLOW_SET_THEME) {
      window.setTheme = (id: string) => setRemoteThemeId(id);
      window.getThemes = () => {
        fetchThemes().then(console.log);
        return 'Fetching...';
      };
      return () => {
        delete window.setTheme;
        delete window.getThemes;
      };
    }
  }, [setRemoteThemeId]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default MergedThemeProvider;
