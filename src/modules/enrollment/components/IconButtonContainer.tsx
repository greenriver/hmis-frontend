import { SvgIconComponent } from '@mui/icons-material';
import { ButtonProps, IconButton, IconButtonProps, Stack } from '@mui/material';
import { ReactNode } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';

const IconButtonContainer = ({
  children,
  Icon,
  onClick,
  tooltip,
  ButtonProps,
}: {
  children?: ReactNode;
  Icon: SvgIconComponent;
  onClick: IconButtonProps['onClick'];
  tooltip?: ReactNode;
  ButtonProps?: ButtonProps;
}) => {
  const button = (
    <IconButton
      sx={{ padding: 0.5, color: 'links' }}
      size='small'
      onClick={onClick}
      {...ButtonProps}
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
