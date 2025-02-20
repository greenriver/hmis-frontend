import { TableCellProps } from '@mui/material';

export type AttributeName<T> = keyof T;
export type RenderFunction<T> = (value: T) => React.ReactNode;

type BaseColumnDef<T> = {
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
  optional?: boolean;
  defaultHidden?: boolean;
  sticky?: 'left' | 'right';
  // If the column is optional, then you can optionally provide an optionalFieldFlag, which tells GenericTableWithData how to update the query variables.
  // Discuss this idea. It's not ideal because ColumnDef is used by GenericTable, but this concept is specific to GenericTableWithData.
  optionalFieldFlag?: string;
};

export type ColumnDef<T> =
  | (BaseColumnDef<T> & {
      // Header is the text to display in the header cell for this column. It's optional (see below)
      header: string | React.ReactNode;
      // key is an optional unique key for this column. If not provided, header is used.
      key?: string;
    })
  | (BaseColumnDef<T> & {
      // If header is not provided, then key is required
      header?: never;
      key: string;
    });

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
