import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
import { isEmpty } from 'lodash-es';
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from 'material-ui-popup-state/hooks';
import { ReactNode, useState } from 'react';

import TableFilterButton from './FilterButton';

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
  const [intermediateValue, setIntermediateValue] =
    useState<typeof columnsValue>(columnsValue);
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
      <Popover
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
        <Box p={2}>
          <Typography variant='overline'>Show Columns</Typography>
          <FormGroup>
            {columns.map(({ value, header }) => (
              <FormControlLabel
                key={value}
                control={
                  <Checkbox checked={intermediateValue.includes(value)} />
                }
                onChange={(e, checked) =>
                  setIntermediateValue(
                    checked
                      ? [...intermediateValue, value]
                      : intermediateValue.filter((v) => v !== value)
                  )
                }
                label={header}
              />
            ))}
          </FormGroup>
          <Divider sx={{ mt: 3 }} />
          <Stack direction='row' gap={1} p={2}>
            <Box flexGrow={1}>
              <Button
                variant='text'
                color='error'
                size='small'
                onClick={() => {
                  setColumnsValue(
                    columns
                      .filter((col) => !col.defaultHidden)
                      .map((col) => col.value)
                  );
                  setIntermediateValue(
                    columns
                      .filter((col) => !col.defaultHidden)
                      .map((col) => col.value)
                  );
                  popupState.close();
                }}
              >
                <strong>Reset</strong>
              </Button>
            </Box>
            <Button
              variant='text'
              size='small'
              color='inherit'
              sx={(theme) => ({ color: theme.palette.text.secondary })}
              onClick={() => {
                setIntermediateValue(columnsValue);
                popupState.close();
              }}
            >
              <strong>Cancel</strong>
            </Button>
            <Button
              size='small'
              onClick={() => {
                setColumnsValue(intermediateValue);
              }}
            >
              <strong>Apply</strong>
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export default TableColumnsMenu;
