// height of bar linking to warehouse and CAS
export const OP_LINK_BAR_HEIGHT = 40;

// whether to show bar linking to warehouse and cas
export const SHOW_OP_LINK_BAR =
  import.meta.env.MODE === 'staging' &&
  import.meta.env.PUBLIC_WAREHOUSE_URL &&
  import.meta.env.PUBLIC_CAS_URL;

// height of main app bar
export const APP_BAR_HEIGHT = 64;

// height of context header (breadcrumbs)
export const CONTEXT_HEADER_HEIGHT = 48;

// overall sticky app bar height
export const STICKY_BAR_HEIGHT = SHOW_OP_LINK_BAR
  ? APP_BAR_HEIGHT + OP_LINK_BAR_HEIGHT
  : APP_BAR_HEIGHT;

// width of sidenav on client dashboard
export const DESKTOP_NAV_SIDEBAR_WIDTH = 300;

// height of sticky header on household assessment view
export const HOUSEHOLD_ASSESSMENTS_HEADER_HEIGHT = 72;
