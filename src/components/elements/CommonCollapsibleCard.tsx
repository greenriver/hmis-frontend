import { Collapse, CollapseProps } from '@mui/material';
import React from 'react';
import CommonBaseCard, {
  CommonBaseCardProps,
} from '@/components/elements/CommonBaseCard';
import {
  ExpandLessIcon,
  ExpandMoreIcon,
} from '@/components/elements/SemanticIcons';

interface CommonCollapsibleCardProps
  extends Omit<CommonBaseCardProps, 'onClickHeader' | 'headerActions'> {
  open?: boolean;
  onClick?: VoidFunction;
  onExited?: CollapseProps['onExited'];
}

/**
 * Collapsible version of CommonBaseCard
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
  ...props
}) => (
  <CommonBaseCard
    onClickHeader={onClick}
    actions={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
    {...props}
  >
    <Collapse in={open} timeout='auto' unmountOnExit onExited={onExited}>
      {children}
    </Collapse>
  </CommonBaseCard>
);

export default CommonCollapsibleCard;
