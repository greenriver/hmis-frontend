export interface NavItem<T> {
  id: string;
  title?: React.ReactNode;
  icon?: React.ReactElement;
  items?: NavItem<T>[];
  href?: string;
  path?: string; // path that this nav item links to
  pathParams?: Record<string, string>; // params to use for linking to path
  activePaths?: string[]; // additional paths that this nav item should be active for
  type?: 'topic' | 'category' | 'section';
  hide?: boolean;
  permissions?: (keyof Omit<T, 'id' | '__typename'>)[];
  permissionMode?: 'any' | 'all';
}
