export interface NavItem {
  id: string;
  title?: React.ReactNode;
  icon?: React.ReactElement;
  items?: NavItem[];
  href?: string;
  path?: string;
  type?: 'topic' | 'category' | 'section';
  hide?: boolean;
}
