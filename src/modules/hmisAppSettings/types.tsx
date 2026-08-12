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
  // Read at runtime from GET /hmis/app_settings rather than baked in at build
  // time, so one set of compiled assets serves installations on either auth
  // method. Optional: backends predating SSO omit it, and resolveAuthMethod
  // treats that as 'devise'.
  authMethod?: 'devise' | 'jwt';
}
