import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { includes, isNil, zipObject } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';

import { ChangeType, GroupItemComponentProps } from '../../types';
import {
  getAllChildLinkIds,
  getPopulatableChildren,
  gqlValueToFormValue,
} from '../../util/formUtil';
import {
  isTypicalRelatedRecord,
  RelatedRecord,
} from '../../util/recordPickerUtil';
import RecordPickerDialog, {
  tableComponentForType,
} from '../RecordPickerDialog';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';

const FormCard = ({
  item,
  severalItemsChanged,
  renderChildItem,
  anchor,
  values,
  locked,
}: GroupItemComponentProps & { anchor?: string }) => {
  const [fillDialogOpen, setFillDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [sourceRecord, setSourceRecord] = useState<RelatedRecord | undefined>();

  const fillable = useMemo(
    () =>
      item.recordType && item.prefill && tableComponentForType(item.recordType),
    [item]
  );

  const childLinkIds = useMemo(() => getAllChildLinkIds(item), [item]);
  const hasAnyChildValues = useMemo(
    () =>
      !!Object.keys(values).find(
        (linkId) => includes(childLinkIds, linkId) && !isNil(values[linkId])
      ),
    [childLinkIds, values]
  );
  const onClear = useCallback(() => {
    const updatedValues = zipObject(
      childLinkIds,
      new Array(childLinkIds.length).fill(null)
    );

    severalItemsChanged({ values: updatedValues, type: ChangeType.User });
    setSourceRecord(undefined);
    setClearDialogOpen(false);
  }, [severalItemsChanged, childLinkIds]);

  const onSelectAutofillRecord = useCallback(
    (record: RelatedRecord) => {
      setSourceRecord(record);
      setFillDialogOpen(false);

      const newFormValues: Record<string, any> = {};
      getPopulatableChildren(item).forEach((i) => {
        if (!i.fieldName) return;

        const gqlValue = record[i.fieldName as keyof RelatedRecord];
        newFormValues[i.linkId] = gqlValueToFormValue(gqlValue, i);
      });

      severalItemsChanged({ values: newFormValues, type: ChangeType.User });
    },
    [setFillDialogOpen, severalItemsChanged, item]
  );

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
            {fillable && (
              <Stack direction='row' spacing={2}>
                <Button
                  onClick={() => setFillDialogOpen(true)}
                  variant='outlined'
                  size='small'
                  sx={{ height: 'fit-content' }}
                  disabled={locked}
                >
                  Fill Section
                </Button>
                <Button
                  variant='outlined'
                  size='small'
                  color='error'
                  sx={{ height: 'fit-content' }}
                  onClick={() => setClearDialogOpen(true)}
                  data-testid='clearButton'
                  disabled={!hasAnyChildValues || locked}
                >
                  Clear Section
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
        {fillable && item.recordType && (
          <>
            <RecordPickerDialog
              id={`recordPickerDialog-${item.linkId}`}
              item={item}
              recordType={item.recordType}
              open={fillDialogOpen}
              onSelected={onSelectAutofillRecord}
              onCancel={() => setFillDialogOpen(false)}
            />
            <ConfirmationDialog
              id='clearSection'
              open={clearDialogOpen}
              title='Clear Section'
              onConfirm={onClear}
              onCancel={() => setClearDialogOpen(false)}
              loading={false}
            >
              <Typography>
                This will clear all the content in the <b>{item.text}</b>{' '}
                section.
              </Typography>
            </ConfirmationDialog>
          </>
        )}
      </Paper>
    </Grid>
  );
};
export default FormCard;
