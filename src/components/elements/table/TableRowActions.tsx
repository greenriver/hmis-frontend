import { Button, Stack } from '@mui/material';
import { ReactNode } from 'react';
import ButtonLink from '../ButtonLink';
import CommonMenuButton, { CommonMenuItem } from '../CommonMenuButton';

interface TableRowActionsProps<T> {
  record: T;
  recordName?: string;
  // Use primaryActionConfig if the primary action is a simple navigation that can be represented by a CommonMenuItem
  primaryActionConfig?: CommonMenuItem;
  // Use primaryAction if the primary action needs to be customized
  primaryAction?: ReactNode;
  // Secondary actions are assumed to all be simple
  secondaryActionConfigs?: CommonMenuItem[];
}

const TableRowActions = <T extends { id: string }>({
  record,
  recordName,
  primaryAction,
  primaryActionConfig,
  secondaryActionConfigs,
}: TableRowActionsProps<T>) => {
  return (
    <Stack direction='row' alignItems='center' justifyContent='end' gap={0.5}>
      {!!primaryActionConfig && primaryActionConfig.to && (
        <ButtonLink
          to={primaryActionConfig.to || ''}
          size='small'
          variant='outlined'
          aria-label={
            primaryActionConfig.ariaLabel ||
            `${primaryActionConfig.title}, ${recordName}`
          }
          state={primaryActionConfig.linkState}
        >
          {primaryActionConfig.title}
        </ButtonLink>
      )}
      {!!primaryActionConfig && primaryActionConfig.onClick && (
        <Button
          onClick={primaryActionConfig.onClick}
          size='small'
          variant='outlined'
          aria-label={
            primaryActionConfig.ariaLabel ||
            `${primaryActionConfig.title}, ${recordName}`
          }
        >
          {primaryActionConfig.title}
        </Button>
      )}
      {primaryAction}
      {!!secondaryActionConfigs && secondaryActionConfigs.length > 0 && (
        <CommonMenuButton
          iconButton
          title='Actions'
          items={secondaryActionConfigs}
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
