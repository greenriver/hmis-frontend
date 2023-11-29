import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { ReactNode } from 'react';

import TableControlPopover from './TableControlPopover';
import useIntermediateState from '@/hooks/useIntermediateState';

export interface TableColumnsMenuProps {
  columns: { value: string; header: ReactNode; defaultHidden: boolean }[];
  columnsValue: string[];
  setColumnsValue: (value: string[]) => any;
}

const TableColumnsMenu = ({
  columns,
  columnsValue,
  setColumnsValue,
}: TableColumnsMenuProps): JSX.Element => {
  const defaultValue = columns
    .filter((col) => !col.defaultHidden)
    .map((col) => col.value);
  const { state, setState, reset, cancel } = useIntermediateState(
    columnsValue,
    defaultValue
  );

  return (
    <TableControlPopover
      label='Columns'
      icon={<ViewColumnIcon />}
      header='Show Columns'
      filterCount={columnsValue.length}
      onCancel={cancel}
      onApply={() => setColumnsValue(state)}
      onReset={() => {
        setColumnsValue(defaultValue);
        reset();
      }}
    >
      <FormGroup>
        {columns.map(({ value, header }) => (
          <FormControlLabel
            key={value}
            control={<Checkbox checked={state.includes(value)} />}
            onChange={(e, checked) =>
              setState(
                checked ? [...state, value] : state.filter((v) => v !== value)
              )
            }
            label={header}
          />
        ))}
      </FormGroup>
    </TableControlPopover>
  );
};

export default TableColumnsMenu;
