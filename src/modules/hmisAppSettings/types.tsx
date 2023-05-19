import { ThemeOptions } from '@mui/material';

export interface GlobalFeatureFlags {
  mciId?: boolean;
  externalReferrals?: boolean;
}

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
  globalFeatureFlags?: GlobalFeatureFlags;
  theme?: ThemeOptions;
}
