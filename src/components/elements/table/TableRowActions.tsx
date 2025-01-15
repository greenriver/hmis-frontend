import { Button, ButtonProps, Stack } from '@mui/material';
import { ReactNode } from 'react';
import ButtonLink from '../ButtonLink';
import CommonMenuButton, { CommonMenuItem } from '../CommonMenuButton';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { GoIcon } from '@/components/elements/SemanticIcons';
import { useIsMobile } from '@/hooks/useIsMobile';
import IconButtonContainer from '@/modules/enrollment/components/IconButtonContainer';

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
  const isTiny = useIsMobile('sm');

  const primaryAria =
    primaryActionConfig?.ariaLabel ||
    `${primaryActionConfig?.title}, ${recordName}`;

  const buttonProps: Pick<ButtonProps, 'size' | 'variant' | 'aria-label'> = {
    size: 'small',
    variant: 'outlined',
    'aria-label': primaryAria,
  };

  return (
    <Stack
      direction='row'
      alignItems='center'
      justifyContent='end'
      gap={{ xs: 0, sm: 0.5 }}
    >
      {!!primaryActionConfig &&
        primaryActionConfig.to &&
        (isTiny ? (
          <ButtonTooltipContainer title={primaryAria}>
            <ButtonLink
              to={primaryActionConfig.to || ''}
              state={primaryActionConfig.linkState}
              {...buttonProps}
              variant='text'
              sx={{ maxWidth: '20px', minWidth: 0 }}
            >
              <GoIcon />
            </ButtonLink>
          </ButtonTooltipContainer>
        ) : (
          <ButtonLink
            to={primaryActionConfig.to || ''}
            state={primaryActionConfig.linkState}
            {...buttonProps}
          >
            {primaryActionConfig.title}
          </ButtonLink>
        ))}
      {!!primaryActionConfig &&
        primaryActionConfig.onClick &&
        (isTiny ? (
          <IconButtonContainer
            Icon={GoIcon}
            onClick={primaryActionConfig.onClick}
            tooltip={primaryAria}
            IconButtonProps={{ size: 'medium' }}
          />
        ) : (
          <Button onClick={primaryActionConfig.onClick} {...buttonProps}>
            {primaryActionConfig.title}
          </Button>
        ))}
      {primaryAction}
      {!!secondaryActionConfigs && secondaryActionConfigs.length > 0 && (
        <CommonMenuButton
          iconButton
          title='Actions'
          items={[
            ...(primaryActionConfig ? [primaryActionConfig] : []),
            ...secondaryActionConfigs,
          ]}
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
