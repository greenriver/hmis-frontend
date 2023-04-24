import { Box, Grid, Typography } from '@mui/material';

import { GroupItemComponentProps } from '../../types';

import { Component } from '@/types/gqlTypes';

const QuestionGroup = ({
  item,
  nestingLevel,
  renderChildItem,
}: GroupItemComponentProps) => {
  const wrappedChildren = (
    <Grid container direction='column' sx={{ mt: 0 }}>
      {renderChildItem &&
        item.item?.map((childItem) => renderChildItem(childItem))}
    </Grid>
  );

  if (nestingLevel === 1) {
    const indentChildren =
      !!item.item &&
      !!item.item[0].enableWhen &&
      // Don't indent InfoGroup because it already has visual distinction
      item.component !== Component.InfoGroup;

    return (
      <Grid item xs>
        <Box
          sx={
            indentChildren
              ? {
                  pl: 2,
                  borderLeft: (theme) => `2px solid ${theme.palette.grey[400]}`,
                }
              : undefined
          }
        >
          {item.text && <Typography sx={{ mb: 2 }}>{item.text}</Typography>}
          {wrappedChildren}
        </Box>
      </Grid>
    );
  }

  return (
    <Grid item xs>
      {item.text && <Typography sx={{ mb: 2 }}>{item.text}</Typography>}
      {wrappedChildren}
    </Grid>
  );
};

export default QuestionGroup;
