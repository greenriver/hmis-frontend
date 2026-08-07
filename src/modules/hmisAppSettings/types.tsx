import { ThemeOptions } from '@mui/material';
export interface HmisAppSettings {
  oktaPath?: string;
  logoPath?: string;
  warehouseUrl?: string;
  warehouseName?: string;
  resetPasswordUrl?: string;
  unlockAccountUrl?: string;
  manageAccountUrl?: string;
  casUrl?: string;
  appName?: string;
  theme?: ThemeOptions;
  // Served by GET /hmis/app_settings. Optional because older backends don't send
  // it - see useAuthMethod() for the fallback behavior.
  authMethod?: 'devise' | 'jwt';
}
