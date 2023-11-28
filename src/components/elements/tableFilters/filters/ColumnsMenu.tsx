import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import {
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { isEmpty } from 'lodash-es';
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from 'material-ui-popup-state/hooks';
import { ReactNode } from 'react';

import TableFilterButton from './FilterButton';

export interface TableColumnsMenuProps {
  columns: { value: string; header: ReactNode }[];
  columnsValue: string[];
  setColumnsValue: (value: string[]) => any;
}

const TableColumnsMenu = ({
  columns,
  columnsValue,
  setColumnsValue,
}: TableColumnsMenuProps): JSX.Element => {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'sortMenu',
  });

  return (
    <>
      <TableFilterButton
        startIcon={<ViewColumnIcon />}
        active={!isEmpty(columnsValue)}
        {...bindTrigger(popupState)}
      >
        Columns
      </TableFilterButton>
      <Menu
        {...bindMenu(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Typography variant='overline' px={2} mb={1} component='li'>
          Show Columns
        </Typography>
        {columns.map(({ value, header }) => (
          <MenuItem
            key={value}
            value={value}
            selected={columnsValue.includes(value)}
            onClick={() =>
              setColumnsValue(
                columnsValue.includes(value)
                  ? columnsValue.filter((c) => c !== value)
                  : [...columnsValue, value]
              )
            }
          >
            <ListItemIcon>
              {columnsValue.includes(value) ? (
                <CheckBoxIcon color='primary' />
              ) : (
                <CheckBoxOutlineBlankIcon />
              )}
            </ListItemIcon>
            <ListItemText>{header}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default TableColumnsMenu;
