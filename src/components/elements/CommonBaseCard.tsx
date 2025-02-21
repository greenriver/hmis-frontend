import { Paper, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { ReactNode } from 'react';
import {
  commonCardPaperPadding,
  commonCardTitleVariant,
} from '@/components/elements/CommonCard';

export interface CommonBaseCardProps {
  title: string;
  titleBorder?: boolean; // Render border below title
  actions?: ReactNode; // Action element to render to the right of title, usually button
  TitleComponent?: React.ElementType; // Use different component for title
  children: ReactNode; // Card content
  padContent?: boolean; // Whether content is padded
  onClickHeader?: VoidFunction;
}

/**
 * Card with a header and content.
 *
 * Header can optionally have a border below it.
 * Header can optionally have "action" content (usually a button) rendered to the right.
 * Header can optionally be clickable (used for collapsible cards).
 * Content can optionally be padded (padContent). Un-pad content if rendering a table in the card.
 *
 * TODO(#7191): Consolidate with CommonCard and TitleCard
 */
const CommonBaseCard: React.FC<CommonBaseCardProps> = ({
  title,
  children,
  titleBorder = false,
  padContent = true,
  TitleComponent,
  onClickHeader,
  actions,
}) => {
  const cardTitle = (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      onClick={onClickHeader}
      sx={{
        ...(onClickHeader
          ? {
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'primary.100' },
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
      {actions}
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
      {cardContent}
    </Paper>
  );
};

export default CommonBaseCard;
