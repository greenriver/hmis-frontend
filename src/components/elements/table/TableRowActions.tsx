import { Stack } from '@mui/material';
import { useMemo } from 'react';
import ButtonLink from '../ButtonLink';
import CommonMenuButton, { CommonMenuItem } from '../CommonMenuButton';

export type TableRowAction<T> = Omit<CommonMenuItem, 'to' | 'onClick'> & {
  // getUrl: given a record, return the URL this action should link to.
  // E.g. for the "View Client" action on an Enrollment table, given the Enrollment record, return the link to the Client.
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
  const accessibleName = recordName || record.id;

  const menuItems = useMemo(() => {
    if (!rest.length) return null;

    return rest.map((action) => {
      return {
        to: action.getUrl(record),
        ariaLabel: `${action.title} - ${accessibleName}`,
        ...action,
      };
    });
  }, [rest, record, accessibleName]);

  return (
    <Stack direction='row' alignItems='center' gap={0.5}>
      {!!primaryAction && (
        <ButtonLink
          to={primaryAction.getUrl(record)}
          size='small'
          variant='outlined'
          aria-label={`${primaryAction.title} - ${accessibleName}`}
        >
          {primaryAction.title}
        </ButtonLink>
      )}
      {!!menuItems && (
        <CommonMenuButton
          iconButton
          title='Actions'
          items={menuItems}
          aria-label={`Action menu for ${accessibleName}`}
        />
      )}
    </Stack>
  );
};

export default TableRowActions;
