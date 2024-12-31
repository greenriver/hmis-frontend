import { Button, Stack } from '@mui/material';
import React, { ReactNode, useMemo } from 'react';
import ButtonLink from '../ButtonLink';
import CommonMenuButton, { CommonMenuItem } from '../CommonMenuButton';

export type TableRowActionsType = {
  primaryAction?: CommonMenuItem | ReactNode;
  secondaryActions?: CommonMenuItem[];
};

interface TableRowActionsProps<T> {
  record: T;
  recordName?: string;
  loading?: boolean;
  getActions: (record: T, loading?: boolean) => TableRowActionsType;
}

const TableRowActions = <T extends { id: string }>({
  record,
  recordName,
  getActions,
  loading,
}: TableRowActionsProps<T>) => {
  const accessibleName = useMemo(
    () => recordName || record.id,
    [record.id, recordName]
  );

  const { primaryAction, secondaryActions } = useMemo(
    () => getActions(record, loading),
    [getActions, loading, record]
  );

  const { primaryActionNode, primaryActionTypesafe } = useMemo(() => {
    return React.isValidElement(primaryAction)
      ? { primaryActionNode: primaryAction }
      : { primaryActionTypesafe: primaryAction as CommonMenuItem };
  }, [primaryAction]);

  const secondariesWithAria = useMemo(
    () =>
      secondaryActions?.map((s) => {
        return {
          ...s,
          ariaLabel: s.ariaLabel || `${s.title}, ${recordName}`,
        };
      }),
    [secondaryActions, recordName]
  );

  return (
    <Stack direction='row' alignItems='center' justifyContent='end' gap={0.5}>
      {primaryActionNode}
      {!!primaryActionTypesafe && !!primaryActionTypesafe.to && (
        <ButtonLink
          to={primaryActionTypesafe.to}
          size='small'
          variant='outlined'
          aria-label={
            primaryActionTypesafe.ariaLabel ||
            `${primaryActionTypesafe.title}, ${recordName}`
          }
          state={primaryActionTypesafe.linkState}
        >
          {primaryActionTypesafe.title}
        </ButtonLink>
      )}
      {!!primaryActionTypesafe && !!primaryActionTypesafe.onClick && (
        <Button
          onClick={primaryActionTypesafe.onClick}
          size='small'
          variant='outlined'
          aria-label={
            primaryActionTypesafe.ariaLabel ||
            `${primaryActionTypesafe.title}, ${recordName}`
          }
        >
          {primaryActionTypesafe.title}
        </Button>
      )}
      {!!secondariesWithAria && secondariesWithAria.length > 0 && (
        <CommonMenuButton
          iconButton
          title='Actions'
          items={secondariesWithAria}
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
