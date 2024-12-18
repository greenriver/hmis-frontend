import { Stack } from '@mui/material';
import { useMemo } from 'react';
import ButtonLink from '../ButtonLink';
import CommonMenuButton, { CommonMenuItem } from '../CommonMenuButton';

export type TableRowActionsType = {
  primaryAction?: CommonMenuItem;
  secondaryActions?: CommonMenuItem[];
};

interface TableRowActionsProps<T> {
  record: T;
  recordName?: string;
  getActions: (record: T) => TableRowActionsType;
}

const TableRowActions = <T extends { id: string }>({
  record,
  recordName,
  getActions,
}: TableRowActionsProps<T>) => {
  const accessibleName = useMemo(
    () => recordName || record.id,
    [record.id, recordName]
  );

  const { primaryAction, secondaryActions } = useMemo(
    () => getActions(record),
    [getActions, record]
  );

  return (
    <Stack direction='row' alignItems='center' gap={0.5}>
      {!!primaryAction && (
        <ButtonLink
          to={primaryAction.to || ''}
          size='small'
          variant='outlined'
          aria-label={primaryAction.ariaLabel}
        >
          {primaryAction.title}
        </ButtonLink>
      )}
      {!!secondaryActions && secondaryActions.length > 0 && (
        <CommonMenuButton
          iconButton
          title='Actions'
          items={secondaryActions}
          ButtonProps={{
            'aria-label': `Action menu for ${accessibleName}`,
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
