import { Tooltip, TooltipProps } from '@mui/material';

const ButtonTooltipContainer = ({
  title,
  children,
  ...props
}: TooltipProps) => {
  if (!title) return children;

  return (
    <Tooltip title={title} placement='top' arrow {...props}>
      <span>{children}</span>
    </Tooltip>
  );
};

export default ButtonTooltipContainer;
