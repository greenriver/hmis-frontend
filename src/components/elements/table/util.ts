import { ColumnDef } from '@/components/elements/table/types';

export function getColumnKey(col: Pick<ColumnDef<any>, 'key' | 'header'>) {
  return col.key || (typeof col.header === 'string' ? col.header : '');
}
