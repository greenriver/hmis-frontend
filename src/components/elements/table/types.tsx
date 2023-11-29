import { TableCellProps } from '@mui/material';
import { ReactNode } from 'react';

export type AttributeName<T> = keyof T;
export type RenderFunction<T> = (value: T) => React.ReactNode;

export interface ColumnDef<T> {
  header?: string | ReactNode;
  render: AttributeName<T> | RenderFunction<T>;
  width?: string;
  minWidth?: string;
  // unique key for element. if not provided, header is used.
  key?: string;
  // whether to hide this column
  hide?: boolean;
  // whether to show link treatment for this cell. rowLinkTo must be provided.
  linkTreatment?: boolean;
  // whether to NOT link this cell even when the whole row is linked using rowLinkTo. Use if there are clickable elements in the cell.
  dontLink?: boolean;
  // aria label, for use with linkTreatment
  ariaLabel?: (row: T) => string;
  textAlign?: 'center' | 'end' | 'justify' | 'left' | 'right' | 'start';
  tableCellProps?: TableCellProps;
}

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
