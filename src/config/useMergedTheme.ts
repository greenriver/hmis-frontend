import { Theme, ThemeOptions } from '@mui/material';
import { useEffect, useState } from 'react';

import defaultTheme, { createFullTheme } from './theme';
import { fetchTheme } from './utils';

import useLocalStorage from '@/hooks/useLocalStorage';

const useMergedTheme = (remoteThemeId?: string) => {
  const [remoteThemeOptions, setRemoteThemeOptions] = useLocalStorage<
    ThemeOptions | undefined
  >('remoteTheme', undefined);
  const [mergedTheme, setMergedTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    if (!remoteThemeId) return;
    fetchTheme(remoteThemeId).then((data) =>
      setRemoteThemeOptions(data as ThemeOptions)
    );
  }, [remoteThemeId, setRemoteThemeOptions]);

  useEffect(() => {
    try {
      const newTheme = createFullTheme(remoteThemeOptions);
      setMergedTheme(newTheme);
    } catch (err) {
      console.error('Error merging themes', err);
    }
  }, [remoteThemeOptions]);

  return mergedTheme;
};

export default useMergedTheme;
