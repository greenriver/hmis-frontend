import { Box, Collapse, CollapseProps } from '@mui/material';
import React, { useCallback, useId, useState } from 'react';
import CommonCard, { CommonCardProps } from '@/components/elements/CommonCard';
import {
  ExpandLessIcon,
  ExpandMoreIcon,
} from '@/components/elements/SemanticIcons';

interface CommonCollapsibleCardProps extends Omit<
  CommonCardProps,
  'onClickHeader' | 'headerActions'
> {
  open?: boolean; // Controlled open state
  initialOpen?: boolean; // Uncontrolled initial open state
  onClick?: VoidFunction; // Callback for header click
  onExited?: CollapseProps['onExited'];
}

/**
 * Collapsible version of CommonCard
 *
 * Title can optionally have a border below it.
 * Title can optionally have "action" content (usually a button) rendered to the right.
 * Content can optionally be collapsible.
 * Content can optionally be padded (padContent). Un-pad content if rendering a table in the card.
 *
 * Supports both controlled (`open`) and uncontrolled (`initialOpen`) behavior.
 *
 * TODO(#7191): Consolidate with CommonCard and TitleCard
 */
const CommonCollapsibleCard: React.FC<CommonCollapsibleCardProps> = ({
  open: controlledOpen,
  initialOpen,
  children,
  onClick,
  onExited,
  padContent,
  ...props
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    initialOpen ?? false
  );
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleToggle = useCallback(() => {
    if (!isControlled) {
      setUncontrolledOpen((prev) => !prev);
    }
    if (onClick) {
      onClick();
    }
  }, [isControlled, onClick]);

  const headerId = useId();
  const contentId = useId();

  return (
    <CommonCard
      onClickHeader={handleToggle}
      actions={
        open ? <ExpandLessIcon aria-hidden /> : <ExpandMoreIcon aria-hidden />
      }
      padContent={false} // take over content padding, so there is no padding when collapsed
      cardHeaderProps={{
        id: headerId,
        'aria-expanded': open,
        'aria-controls': contentId,
      }}
      {...props}
    >
      <Box id={contentId} aria-labelledby={headerId} role='region'>
        <Collapse in={open} timeout='auto' unmountOnExit onExited={onExited}>
          <>{padContent ? <Box sx={{ p: 2 }}>{children}</Box> : children}</>
        </Collapse>
      </Box>
    </CommonCard>
  );
};

export default CommonCollapsibleCard;
