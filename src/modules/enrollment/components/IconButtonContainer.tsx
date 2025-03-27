import { SvgIconComponent } from '@mui/icons-material';
import { IconButton, IconButtonProps, Stack } from '@mui/material';
import { ReactNode } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';

const IconButtonContainer = ({
  children,
  Icon,
  onClick,
  tooltip,
  IconButtonProps,
}: {
  children?: ReactNode;
  Icon: SvgIconComponent;
  onClick: IconButtonProps['onClick'];
  tooltip?: ReactNode;
  IconButtonProps?: IconButtonProps;
}) => {
  const button = (
    <IconButton
      sx={{ padding: 0.5, color: 'primary.main' }}
      size='small'
      onClick={onClick}
      {...IconButtonProps}
    >
      <Icon fontSize='inherit' />
    </IconButton>
  );
  return (
    <Stack direction='row' alignItems='center' gap={1}>
      <>{children}</>
      {tooltip ? (
        <ButtonTooltipContainer title={tooltip}>
          {button}
        </ButtonTooltipContainer>
      ) : (
        button
      )}
    </Stack>
  );
};

export default IconButtonContainer;
