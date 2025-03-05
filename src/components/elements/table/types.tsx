import { TableCellProps } from '@mui/material';

export type AttributeName<T> = keyof T;
export type RenderFunction<T> = (value: T) => React.ReactNode;

export type ColumnDef<T> = {
  key: string; // Required. Only needs to be human-readable if Header is not provided (read by screenreader)
  header?: string | React.ReactNode;
  render: AttributeName<T> | RenderFunction<T>;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  // whether to hide this column
  hide?: boolean;
  // whether to NOT link this cell even when the whole row is linked using rowLinkTo. Use if there are clickable elements in the cell.
  dontLink?: boolean;
  textAlign?: 'center' | 'end' | 'justify' | 'left' | 'right' | 'start';
  tableCellProps?: TableCellProps | ((row: T) => TableCellProps);
  headerCellProps?: TableCellProps;
  sticky?: 'left' | 'right';
};

export function isPrimitive<T>(value: any): value is AttributeName<T> {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

export function isRenderFunction<T>(value: any): value is RenderFunction<T> {
  return typeof value === 'function';
}
