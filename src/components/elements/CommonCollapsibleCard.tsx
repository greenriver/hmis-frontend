import { Box, Collapse, CollapseProps } from '@mui/material';
import React from 'react';
import CommonCard, { CommonCardProps } from '@/components/elements/CommonCard';
import {
  ExpandLessIcon,
  ExpandMoreIcon,
} from '@/components/elements/SemanticIcons';

interface CommonCollapsibleCardProps
  extends Omit<CommonCardProps, 'onClickHeader' | 'headerActions'> {
  open?: boolean;
  onClick?: VoidFunction;
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
 * TODO(#7191): Consolidate with CommonCard and TitleCard
 */
const CommonCollapsibleCard: React.FC<CommonCollapsibleCardProps> = ({
  open,
  children,
  onClick,
  onExited,
  padContent,
  ...props
}) => {
  return (
    <CommonCard
      onClickHeader={onClick}
      actions={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      padContent={false} // take over content padding, so there is no padding when collapsed
      {...props}
    >
      <Collapse
        in={open}
        timeout='auto'
        unmountOnExit
        onExited={onExited}
        collapsedSize={'0px'}
      >
        <>{padContent ? <Box sx={{ p: 2 }}>{children}</Box> : children}</>
      </Collapse>
    </CommonCard>
  );
};

export default CommonCollapsibleCard;
