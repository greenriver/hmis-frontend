import { ThemeOptions } from '@mui/material';

import { HmisUser } from '../auth/api/sessions';

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

export interface HmisAuthState {
  user?: HmisUser;
  setUser: (user: HmisUser | undefined) => void;
}

export interface RouteLocationState {
  /** Previous pathname, so we can redirect to it when logging back in */
  prev?: string;
  /** Whether to clear/ignore the previous pathname. For example when someone clicks "Sign Out," the previous location shouldn't be maintained when they log back
  in.  */
  clearPrev?: boolean;
}
