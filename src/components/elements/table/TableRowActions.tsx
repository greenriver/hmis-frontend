import { Stack } from '@mui/material';
import { ReactNode } from 'react';
import CommonMenuButton, { CommonMenuItem } from '../CommonMenuButton';

interface TableRowActionsProps<T> {
  record: T;
  recordName?: string;
  primaryAction?: ReactNode;
  menuActionConfigs?: CommonMenuItem[];
}

const TableRowActions = <T extends { id: string }>({
  record,
  recordName,
  primaryAction,
  menuActionConfigs,
}: TableRowActionsProps<T>) => {
  return (
    <Stack
      direction='row'
      alignItems='center'
      justifyContent='end'
      gap={{ xs: 0, sm: 0.5 }}
    >
      {primaryAction}
      {!!menuActionConfigs && menuActionConfigs.length > 0 && (
        <CommonMenuButton
          iconButton
          title='Actions'
          items={menuActionConfigs}
          ButtonProps={{
            'aria-label': `Action menu for ${recordName || record.id}`,
          }}
          MenuProps={{
            MenuListProps: {
              dense: true,
            },
          }}
        />
      )}
    </Stack>
  );
};

export default TableRowActions;
