import {
  Collapse,
  CollapseProps,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { ReactNode } from 'react';
import {
  commonCardPaperPadding,
  commonCardTitleVariant,
} from '@/components/elements/CommonCard';
import {
  ExpandLessIcon,
  ExpandMoreIcon,
} from '@/components/elements/SemanticIcons';

export interface CommonCardProps {
  title: string;

  titleBorder?: boolean; // Render border below title
  TitleComponent?: React.ElementType; // Use different component for title
  children: ReactNode; // Card content
  padContent?: boolean; // Whether content is padded
  actions?: ReactNode; // Top-right actions, not compatible with collapsible
  // collapse props
  collapsible?: boolean;
  open?: boolean;
  onClick?: VoidFunction;
  onExited?: CollapseProps['onExited'];
}

/**
 * Card with a title and content.
 * Title can optionally have a border below it.
 * Title can optionally have "action" content (usually a button) rendered to the right.
 * Content can optionally be collapsible.
 * Content can optionally be padded (padContent). Un-pad content if rendering a table in the card.
 *
 * TODO(#7191): Consolidate with CommonCard and TitleCard
 */
const CommonCollapsibleCard: React.FC<CommonCardProps> = ({
  open,
  title,
  children,
  onClick,
  onExited,
  collapsible,
  titleBorder = false,
  padContent = true,
  actions,
  TitleComponent,
}) => {
  if (collapsible && actions)
    throw new Error('Cannot have actions on collapsible card');

  const collapseIcon =
    collapsible && (open ? <ExpandLessIcon /> : <ExpandMoreIcon />);

  const cardTitle = (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      onClick={collapsible ? onClick : undefined}
      sx={{
        ...(collapsible
          ? {
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'grayscale.tint' }, // FIXME(#7108) change to 'primary.surface'
            }
          : {}),
        ...(titleBorder
          ? {
              borderBottomColor: 'borders.light',
              borderBottomWidth: 1,
              borderBottomStyle: 'solid',
            }
          : {}),
        ...commonCardPaperPadding, // make sure this matches CommonCard
        pageBreakInside: 'avoid',
      }}
    >
      <Typography
        variant={commonCardTitleVariant}
        component={TitleComponent || commonCardTitleVariant}
      >
        {title}
      </Typography>
      {collapseIcon}
      {actions && !collapseIcon && <>{actions}</>}
    </Stack>
  );

  const cardContent = padContent ? (
    <Box sx={{ p: 2 }}>{children}</Box>
  ) : (
    children
  );

  return (
    <Paper>
      {cardTitle}
      {collapsible ? (
        <Collapse in={open} timeout='auto' unmountOnExit onExited={onExited}>
          {cardContent}
        </Collapse>
      ) : (
        cardContent
      )}
    </Paper>
  );
};

export default CommonCollapsibleCard;
