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
  ExpandLessIcon,
  ExpandMoreIcon,
} from '@/components/elements/SemanticIcons';

export interface CommonCardProps {
  title?: string;
  titleBorder?: boolean;
  children: ReactNode;
  // whether content is padded
  padContent?: boolean;
  // right actions, not compatible with collapsible
  actions?: ReactNode;
  // collapse
  collapsible?: boolean;
  open?: boolean;
  onClick?: CollapseProps['onClick'];
  onExited?: CollapseProps['onExited'];

  TitleComponent?: React.ElementType;
}

const commonCardPaperPadding = { py: 2, px: 2.5 };
const commonCardTitleVariant = 'h5';

export const CommonCard2: React.FC<CommonCardProps> = ({
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
  const collapsibleSx = {
    cursor: 'pointer',
    '&:hover': { backgroundColor: '#F1F2F9' }, // FIXME: primary surface when theme is merged
  };

  const collapseIcons =
    collapsible && (open ? <ExpandLessIcon /> : <ExpandMoreIcon />);
  const cardTitle = (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      onClick={collapsible ? onClick : undefined}
      sx={{
        ...(collapsible ? collapsibleSx : {}),
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
      {collapseIcons}
      {actions && !collapseIcons && <>{actions}</>}
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
