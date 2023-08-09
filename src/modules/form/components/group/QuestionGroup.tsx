import { Box, Grid, Typography } from '@mui/material';

import { GroupItemComponentProps } from '../../types';

import { Component } from '@/types/gqlTypes';

const QuestionGroup = ({
  item,
  nestingLevel,
  renderChildItem,
  viewOnly = false,
}: GroupItemComponentProps) => {
  const wrappedChildren = (
    <Grid container direction='column' sx={{ mt: 0 }} gap={2}>
      {renderChildItem &&
        item.item?.map((childItem) => renderChildItem(childItem))}
    </Grid>
  );

  const label = viewOnly ? item.readonlyText || item.text : item.text;
  if (nestingLevel >= 1) {
    const indentChildren =
      !!item.item &&
      (!!item.enableWhen || !!item.item[0].enableWhen) &&
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
                  mb: 2, // extra margin below to separate from next question
                }
              : item.text
              ? {
                  mt: 2,
                  mb: 3,
                }
              : undefined
          }
        >
          {label && <Typography sx={{ mb: 2 }}>{label}</Typography>}
          {wrappedChildren}
        </Box>
      </Grid>
    );
  }

  return (
    <Grid item xs>
      {label && <Typography sx={{ mb: 2 }}>{label}</Typography>}
      {wrappedChildren}
    </Grid>
  );
};

export default QuestionGroup;
