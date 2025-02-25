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
  sticky?: 'left' | 'right';
  // configuration for making this column Optional. Only works with GenericTableWithData, will be ignored in GenericTable
  optional?: {
    defaultHidden: boolean;
    queryVariableField?: string; // field to set on QueryVariables if col is included. Not required, because some tables need to query optional column data even when the optional col is hidden, such as Exit Date
    queryVariableValue?: any; // value to set on QueryVariables if col is included (default: true)
  };
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
