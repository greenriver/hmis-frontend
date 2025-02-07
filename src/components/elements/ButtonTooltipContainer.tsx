import { Tooltip, TooltipProps } from '@mui/material';

const ButtonTooltipContainer = ({
  title,
  children,
  ...props
}: TooltipProps) => {
  if (!title) return children;

  return (
    <Tooltip
      title={title}
      placement='top'
      // describeChild makes the tooltip text become the `title` of the direct child,
      // which is a span in this case. Otherwise it would become the `aria-label` of
      // the direct child, which is not valid for spans.
      describeChild
      arrow
      {...props}
    >
      {/* This inner `span` allows Tooltips to appear on disabled Button elements.
      We sometimes do this to explain why the button is disabled.*/}
      <span>{children}</span>
    </Tooltip>
  );
};

export default ButtonTooltipContainer;
