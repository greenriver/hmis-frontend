export interface NavItem<T> {
  id: string;
  title?: React.ReactNode;
  icon?: React.ReactElement;
  items?: NavItem<T>[];
  href?: string;
  path?: string;
  type?: 'topic' | 'category' | 'section';
  hide?: boolean;
  permissions?: (keyof Omit<T, 'id' | '__typename'>)[];
  permissionMode?: 'any' | 'all';
}
