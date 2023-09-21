import { SvgIconComponent } from '@mui/icons-material';
import { IconButton, IconButtonProps, Stack } from '@mui/material';
import { ReactNode } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';

const IconButtonContainer = ({
  children,
  Icon,
  onClick,
  tooltip,
}: {
  children?: ReactNode;
  Icon: SvgIconComponent;
  onClick: IconButtonProps['onClick'];
  tooltip?: ReactNode;
}) => {
  const button = (
    <IconButton
      sx={{ padding: 0.5, color: 'links' }}
      size='small'
      onClick={onClick}
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
