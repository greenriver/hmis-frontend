import { Stack } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import ButtonLink from '../ButtonLink';
import CommonMenuButton, { CommonMenuItem } from '../CommonMenuButton';

interface TableRowActionsProps<T> {
  record: T;
  recordName?: string;
  // todo @martha - add some commentary here
  primaryActionConfig?: CommonMenuItem;
  primaryAction?: ReactNode;
  secondaryActionConfigs?: CommonMenuItem[];
}

const TableRowActions = <T extends { id: string }>({
  record,
  recordName,
  primaryAction,
  primaryActionConfig,
  secondaryActionConfigs,
}: TableRowActionsProps<T>) => {
  const accessibleName = useMemo(
    () => recordName || record.id,
    [record.id, recordName]
  );

  return (
    <Stack direction='row' alignItems='center' justifyContent='end' gap={0.5}>
      {!!primaryActionConfig && (
        <ButtonLink
          to={primaryActionConfig.to || ''}
          size='small'
          variant='outlined'
          aria-label={primaryActionConfig.ariaLabel}
        >
          {primaryActionConfig.title}
        </ButtonLink>
      )}
      {primaryAction}
      {!!secondaryActionConfigs && secondaryActionConfigs.length > 0 && (
        <CommonMenuButton
          iconButton
          title='Actions'
          items={secondaryActionConfigs}
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
