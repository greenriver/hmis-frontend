import { ThemeOptions } from '@mui/material';
import { ReactNode } from 'react';
export interface HmisAppSettings {
  oktaPath?: string;
  logoPath?: string;
  logo?: ReactNode;
  warehouseUrl?: string;
  warehouseName?: string;
  resetPasswordUrl?: string;
  unlockAccountUrl?: string;
  manageAccountUrl?: string;
  casUrl?: string;
  appName?: string;
  theme?: ThemeOptions;
}
