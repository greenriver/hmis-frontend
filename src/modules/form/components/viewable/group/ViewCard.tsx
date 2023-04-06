import {
  Button,
  ButtonProps,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';

import { ViewGroupItemComponentProps } from '../../../types';
import {
  getAllChildLinkIds,
} from '../../../util/formUtil';

const ViewCard = ({
  item,
  renderChildItem,
  anchor,
  debug,
}: ViewGroupItemComponentProps & {
  anchor?: string;
  debug?: (ids?: string[]) => void;
}) => {
  // const [sourceRecord, setSourceRecord] = useState<RelatedRecord | undefined>();

  const childLinkIds = useMemo(() => getAllChildLinkIds(item), [item]);

  const buttonProps: ButtonProps = {
    variant: 'outlined',
    size: 'small',
    sx: { height: 'fit-content' },
  };
  return (
    <Grid id={anchor} item>
      <Paper
        sx={{
          py: 3,
          px: 2.5,
        }}
      >
        {/* Card title */}
        {item.text && (
          <Stack justifyContent='space-between' direction='row'>
            <Typography variant='h5' sx={{ mb: 2 }}>
              {item.text}
            </Typography>

            <Stack direction='row' spacing={2}>
              {debug && import.meta.env.MODE === 'development' && (
                <Button {...buttonProps} onClick={() => debug(childLinkIds)}>
                  Debug
                </Button>
              )}
            </Stack>
          </Stack>
        )}

        {/* DO WE NEED TO KEEP THIS FUNCTIONALITY? */}
        {/* Source record description */}
        {/* {sourceRecord && isTypicalRelatedRecord(sourceRecord) && (
          <Typography variant='body2' sx={{ mb: 3 }}>
            Filled with record from{' '}
            {parseAndFormatDate(sourceRecord.informationDate)}
          </Typography>
        )} */}

        {/* Dynamically render child items */}
        <Grid
          container
          direction='column'
          // Spacing between input elements inside the card
          gap={2}
          sx={{
            '& .MuiGrid-item:first-of-type': !item.text ? { pt: 0 } : undefined,
            mt: 0,
          }}
        >
          {renderChildItem &&
            item.item?.map((childItem) => renderChildItem(childItem))}
        </Grid>
      </Paper>
    </Grid>
  );
};
export default ViewCard;
