import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { zipObject } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';

import {
  getAllChildLinkIds,
  getPopulatableChildren,
} from '../../util/formUtil';
import { gqlValueToFormValue } from '../../util/recordFormUtil';
import {
  isTypicalRelatedRecord,
  RelatedRecord,
} from '../../util/recordPickerUtil';
import { GroupItemComponentProps } from '../DynamicGroup';
import RecordPickerDialog, {
  tableComponentForType,
} from '../RecordPickerDialog';

import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';

const FormCard = ({
  item,
  severalItemsChanged,
  renderChildItem,
}: GroupItemComponentProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sourceRecord, setSourceRecord] = useState<RelatedRecord | undefined>();

  const fillable = useMemo(
    () =>
      item.recordType && item.prefill && tableComponentForType(item.recordType),
    [item]
  );

  const onClear = useCallback(() => {
    const linkIds = getAllChildLinkIds(item);
    const updatedValues = zipObject(linkIds, []);
    severalItemsChanged(updatedValues);
    setSourceRecord(undefined);
  }, [item, severalItemsChanged]);

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

  return (
    <Grid id={item.linkId} item>
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
            {fillable && (
              <Stack direction='row' spacing={1}>
                <Button
                  variant='outlined'
                  size='small'
                  sx={{ height: 'fit-content' }}
                  onClick={onClear}
                  data-testid='clearButton'
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

        {/* Source record description */}
        {sourceRecord && isTypicalRelatedRecord(sourceRecord) && (
          <Typography variant='body2' sx={{ mb: 3 }}>
            Filled with record from{' '}
            {parseAndFormatDate(sourceRecord.informationDate)}
          </Typography>
        )}

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

        {/* Dialog for selecting autofill record */}
        {fillable && (
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
};
export default FormCard;
