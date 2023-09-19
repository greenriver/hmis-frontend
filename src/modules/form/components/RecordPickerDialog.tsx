import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { startCase } from 'lodash-es';
import { ReactNode, useMemo } from 'react';

import { AssessmentForPopulation } from '../types';
import { getFieldOnAssessment, getPopulatableChildren } from '../util/formUtil';
import { assessmentColumns } from '../util/recordPickerUtil';

import AssessmentsForPopulationTable from '@/components/clientDashboard/enrollments/tables/AssessmentsForPopulationTable';
import CommonDialog from '@/components/elements/CommonDialog';
import RelativeDate from '@/components/elements/RelativeDate';
import { ColumnDef } from '@/components/elements/table/types';
import HmisField from '@/modules/hmis/components/HmisField';
import { FormItem, FormRole } from '@/types/gqlTypes';

interface Props extends Omit<DialogProps, 'children'> {
  clientId: string;
  open: boolean;
  item?: FormItem;
  description?: ReactNode;
  onSelected: (record: AssessmentForPopulation) => void;
  onCancel: () => void;
  role?: FormRole;
}

const RecordPickerDialog = ({
  onSelected,
  onCancel,
  item,
  open,
  role,
  description,
  clientId,
  ...other
}: Props) => {
  const columns: ColumnDef<AssessmentForPopulation>[] = useMemo(() => {
    // If no item was passed, that means we're pre-filling the entire assessment.
    // Only metadata columns are shown in that case.
    if (!item) return assessmentColumns;

    // Select additional fields to show in table based on child items in the group
    const dataColumns = getPopulatableChildren(item)
      .filter((item) => !item.hidden && !!item.mapping)
      .map((i) => ({
        key: i.mapping?.fieldName || undefined,
        header: i.briefText || i.text || startCase(i.mapping?.fieldName || ''),
        render: (assessment: AssessmentForPopulation) => {
          if (!i.mapping) return;
          const { record, recordType } = getFieldOnAssessment(
            assessment,
            i.mapping
          );

          return (
            <HmisField
              recordType={recordType}
              fieldName={i.mapping?.fieldName || undefined}
              customFieldKey={i.mapping?.customFieldKey || undefined}
              record={record}
            />
          );
        },
      }));
    return [...assessmentColumns, ...dataColumns];
  }, [item]);

  // Need to set height on the dialog in order for the scrolling to work
  const height = `${Math.min(Math.max(columns.length * 60 + 250, 550), 850)}px`;

  return (
    <CommonDialog
      open={open}
      keepMounted={false}
      maxWidth='lg'
      fullWidth
      onClose={onCancel}
      sx={{
        '.MuiDialog-paper': { overflow: 'hidden', height },
      }}
      {...other}
    >
      <DialogTitle>
        {item ? (
          <>
            Choose record for <b>{item.text}</b>
          </>
        ) : (
          'Choose Assessment'
        )}
      </DialogTitle>

      <DialogContent
        sx={{
          pb: 6,
          my: 2,
          overflow: 'hidden',
          height: '100%', // need for scrolling
        }}
      >
        {description}
        <AssessmentsForPopulationTable
          queryVariables={{ id: clientId }}
          defaultPageSize={5}
          columns={columns}
          nonTablePagination
          vertical
          fullHeight
          tableProps={{
            size: 'small',
            stickyHeader: true,
            width: 'fit-content',
          }}
          renderVerticalHeaderCell={(record) => {
            return (
              <Stack spacing={2} sx={{ py: 1 }}>
                <RelativeDate
                  dateString={record.assessmentDate}
                  dateUpdated={record.dateUpdated || undefined}
                  variant='body2'
                  textAlign={'center'}
                  fontWeight={600}
                  withTooltip
                  prefix='Assessment Date: '
                />
                <Button
                  onClick={() => onSelected(record)}
                  variant='outlined'
                  size='small'
                  sx={{ backgroundColor: 'white' }}
                  fullWidth
                  aria-label={`Select record from ${record.assessmentDate}`}
                >
                  Select
                </Button>
              </Stack>
            );
          }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button onClick={onCancel} variant='gray'>
          Close
        </Button>
      </DialogActions>
    </CommonDialog>
  );
};

export default RecordPickerDialog;
