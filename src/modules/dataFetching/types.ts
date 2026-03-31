import { ColumnDef } from '@/components/elements/table/types';

export type DataColumnDef<RowType, QueryVariables> = {
  // extend ColumnDef type to include additional attributes related to data fetching
  optional?: {
    // configuration for making this column Optional
    defaultHidden: boolean;
    queryVariableField?: keyof QueryVariables; // field to set on QueryVariables if col is included. Not required; some tables need to query optional column data even when the optional col is hidden, such as Enrollment Exit Date
    queryVariableValue?: any; // value to set on QueryVariables if col is included (default: true)
  };
} & ColumnDef<RowType>;
