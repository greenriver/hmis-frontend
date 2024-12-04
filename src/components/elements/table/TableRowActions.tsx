import { Stack } from '@mui/material';
import { useMemo } from 'react';
import ButtonLink from '../ButtonLink';
import CommonMenuButton, { CommonMenuItem } from '../CommonMenuButton';

export type TableRowAction<T> = Omit<CommonMenuItem, 'to' | 'onClick'> & {
  // getUrl could be made optional and onClick (omitted above) could be re-enabled
  getUrl: (record: T) => string;
};

interface TableRowActionsProps<T> {
  record: T;
  recordName?: string;
  actions: TableRowAction<T>[];
}

const TableRowActions = <T extends { id: string }>({
  record,
  recordName,
  actions,
}: TableRowActionsProps<T>) => {
  const [primaryAction, ...rest] = actions;

  const menuItems = useMemo(() => {
    if (!rest.length) return null;

    return rest.map((action) => {
      return {
        to: action.getUrl(record),
        ariaLabel: `${action.title} - ${recordName}`,
        ...action,
      };
    });
  }, [rest, record, recordName]);

  return (
    <Stack direction='row' alignItems='center' gap={0.5}>
      {!!primaryAction && (
        <ButtonLink
          to={primaryAction.getUrl(record)}
          size='small'
          variant='outlined'
          aria-label={`${primaryAction.title} - ${recordName}`}
        >
          {primaryAction.title}
        </ButtonLink>
      )}
      {!!menuItems && (
        <CommonMenuButton
          iconButton
          title='Actions'
          items={menuItems}
          aria-label={`Action menu for ${recordName || record.id}`}
        />
      )}
    </Stack>
  );
};

export default TableRowActions;
