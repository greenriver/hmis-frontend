import { ThemeOptions, ThemeProvider } from '@mui/material';
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';

import { createFullTheme } from './theme';
import { fetchTheme, fetchThemes } from './utils';

import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';

const MergedThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { theme: defaultThemeOptions } = useHmisAppSettings();
  const [themeOptions, setThemeOptions] = useState<ThemeOptions | undefined>(
    defaultThemeOptions
  );
  const fullTheme = useMemo(
    () => createFullTheme(themeOptions),
    [themeOptions]
  );

  // Allow changing theme dynamically in the console. This is purely for theme QA.
  // In the dev console, run:
  //    window.getThemes()
  //    window.setTheme(id)
  //
  // For developing new themes:
  //    window.setThemeOptions({ palette: { secondary: { main: '#463576' } } })
  useEffect(() => {
    if (import.meta.env.PUBLIC_ALLOW_SET_THEME) {
      window.setTheme = (id: string) => {
        fetchTheme(id).then((data) => setThemeOptions(data as ThemeOptions));
      };
      window.getThemes = () => {
        fetchThemes().then(console.log);
        return 'Fetching...';
      };
      window.setThemeOptions = (options: ThemeOptions) =>
        setThemeOptions(options);
      return () => {
        delete window.setTheme;
        delete window.getThemes;
      };
    }
  }, [setThemeOptions]);

  return <ThemeProvider theme={fullTheme}>{children}</ThemeProvider>;
};

export default MergedThemeProvider;
