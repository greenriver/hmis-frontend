import { createTheme, Theme, ThemeOptions } from '@mui/material';
// This is what MUI uses internally to merge the themes in createTheme
import deepmerge from '@mui/utils/deepmerge';
import { useEffect, useState } from 'react';

import { baseThemeDef, fullTheme, fullThemeDef } from './theme';
import { fetchTheme } from './utils';

import useLocalStorage from '@/hooks/useLocalStorage';

const useMergedTheme = (remoteThemeId?: string) => {
  const [remoteThemeOptions, setRemoteThemeOptions] = useLocalStorage<
    ThemeOptions | undefined
  >('remoteTheme', undefined);
  const [mergedTheme, setMergedTheme] = useState<Theme>(fullTheme);

  useEffect(() => {
    if (!remoteThemeId) return;
    fetchTheme(remoteThemeId).then((data) =>
      setRemoteThemeOptions(data as ThemeOptions)
    );
  }, [remoteThemeId, setRemoteThemeOptions]);

  useEffect(() => {
    let newTheme = fullTheme;

    try {
      const merged = createTheme(
        deepmerge(
          deepmerge(baseThemeDef, fullThemeDef),
          remoteThemeOptions || {}
        )
      );
      newTheme = merged;
    } catch (err) {
      console.error('Error merging themes', err);
    }

    setMergedTheme(newTheme);
  }, [remoteThemeOptions]);

  return mergedTheme;
};

export default useMergedTheme;
