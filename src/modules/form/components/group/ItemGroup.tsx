import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { zipObject } from 'lodash-es';
import { useCallback, useState } from 'react';

import {
  getAllChildLinkIds,
  getPopulatableChildren,
} from '../../util/formUtil';
import { gqlValueToFormValue } from '../../util/recordFormUtil';
import { GroupItemComponentProps } from '../DynamicGroup';
import RecordPickerDialog, {
  getInformationDate,
  RelatedRecord,
} from '../RecordPickerDialog';

import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';

const ItemGroup = ({
  item,
  nestingLevel,
  renderChildItem,
  severalItemsChanged,
}: GroupItemComponentProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sourceRecord, setSourceRecord] = useState<RelatedRecord | undefined>();
  const direction = 'column'; // item.display?.direction ?? 'column';
  const isColumn = direction === 'column';

  const wrappedChildren = (
    <Grid
      container
      direction={direction}
      rowSpacing={isColumn ? 2 : 0}
      columnSpacing={isColumn ? 0 : 3}
      sx={{
        //'& .MuiGrid-item:first-of-type': { pt: 0 }
        mt: 0,
      }}
    >
      {renderChildItem &&
        item.item?.map((childItem) => renderChildItem(childItem))}
    </Grid>
  );

  const onSelectAutofillRecord = useCallback(
    (record: RelatedRecord) => {
      setSourceRecord(record);
      setDialogOpen(false);

      const newFormValues: Record<string, any> = {};
      getPopulatableChildren(item).forEach((i) => {
        if (!i.fieldName) return;

        const gqlValue = record[i.fieldName as keyof RelatedRecord];
        newFormValues[i.linkId] = gqlValueToFormValue(gqlValue, i);
      });

      severalItemsChanged(newFormValues);
    },
    [setDialogOpen, severalItemsChanged, item]
  );

  const onClear = useCallback(() => {
    const linkIds = getAllChildLinkIds(item);
    const updatedValues = zipObject(linkIds, []);
    severalItemsChanged(updatedValues);
  }, [item, severalItemsChanged]);

  if (nestingLevel === 0) {
    return (
      <Grid item id={item.linkId}>
        <Paper
          sx={{
            py: 3,
            px: 2.5,
          }}
        >
          {item.text && (
            <Stack justifyContent='space-between' direction='row'>
              <Typography variant='h5' sx={{ mb: 2 }}>
                {item.text}
              </Typography>
              {item.recordType && (
                <Stack direction='row' spacing={1}>
                  <Button
                    variant='outlined'
                    size='small'
                    sx={{ height: 'fit-content' }}
                    onClick={onClear}
                  >
                    CLEAR
                  </Button>
                  <Button
                    onClick={() => setDialogOpen(true)}
                    variant='outlined'
                    size='small'
                    sx={{ height: 'fit-content' }}
                  >
                    FILL SECTION
                  </Button>
                </Stack>
              )}
            </Stack>
          )}
          {sourceRecord && item.recordType && (
            <Typography
              variant='body2'
              fontStyle='bold'
              sx={{ mb: 1, fontWeight: 600 }}
            >
              Filled with record from{' '}
              {parseAndFormatDate(
                getInformationDate(item.recordType, sourceRecord)
              )}
            </Typography>
          )}
          {wrappedChildren}
          {item.recordType && (
            <RecordPickerDialog
              id={`recordPickerDialog-${item.linkId}`}
              item={item}
              recordType={item.recordType}
              open={dialogOpen}
              onSelected={onSelectAutofillRecord}
              onCancel={() => setDialogOpen(false)}
            />
          )}
        </Paper>
      </Grid>
    );
  }
  if (nestingLevel === 1) {
    return (
      <Grid item xs>
        <Box sx={{ pl: 1, mb: 2 }}>
          <Box
            sx={{
              pl: 2,
              borderLeft: (theme) => `2px solid ${theme.palette.grey[400]}`,
            }}
          >
            {item.text && <Typography sx={{ mb: 2 }}>{item.text}</Typography>}
            {wrappedChildren}
          </Box>
        </Box>
      </Grid>
    );
  }
  return (
    <>
      {item.text && <Typography sx={{ mb: 2 }}>{item.text}</Typography>}
      {wrappedChildren}
    </>
  );
};

export default ItemGroup;
