import { Paper, Stack, Typography } from '@mui/material';
import { Box, SxProps } from '@mui/system';
import React, { ReactNode } from 'react';

export interface CommonCardProps {
  title?: ReactNode;
  headerVariant?: 'border'; // Optionally render border below title
  actions?: ReactNode; // Action element to render to the right of title, usually button
  TitleComponent?: React.ElementType; // Use different component for title
  children: ReactNode; // Card content
  padContent?: boolean; // Whether content is padded
  onClickHeader?: VoidFunction;
  sx?: SxProps;
}

/**
 * Card with an optional header and content.
 *
 * Header can optionally have a border below it.
 * Header can optionally have "action" content (usually a button) rendered to the right.
 * Header can optionally be clickable (used for collapsible cards).
 * Content can optionally be padded (padContent). Un-pad content if rendering a table in the card.
 *
 * TODO(#7191): Consolidate with TitleCard
 */
const CommonCard: React.FC<CommonCardProps> = ({
  title,
  children,
  headerVariant,
  padContent = true,
  TitleComponent,
  onClickHeader,
  actions,
  sx,
}) => {
  const hasHeaderBorder = headerVariant === 'border';

  const cardTitle =
    typeof title === 'string' ? (
      <Typography variant='h5' component={TitleComponent || 'h5'}>
        {title}
      </Typography>
    ) : (
      title
    );

  const cardHeader = cardTitle && (
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
        ...(hasHeaderBorder
          ? {
              borderBottomColor: 'borders.light',
              borderBottomWidth: 1,
              borderBottomStyle: 'solid',
            }
          : {}),
        py: 2,
        px: 2,
        pageBreakInside: 'avoid',
      }}
    >
      {cardTitle}
      {actions}
    </Stack>
  );

  const cardContent = padContent ? (
    <Box
      sx={{
        px: 2,
        pb: 2,
        // If the card has a header _without_ a Border, don't add extra padding above content
        pt: cardHeader && !hasHeaderBorder ? 0 : 2,
      }}
    >
      {children}
    </Box>
  ) : (
    children
  );

  return (
    <Paper sx={sx}>
      {cardHeader}
      {cardContent}
    </Paper>
  );
};

export default CommonCard;
