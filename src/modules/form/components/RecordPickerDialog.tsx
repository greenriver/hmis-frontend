import { Stack, Tooltip, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { startCase } from 'lodash-es';
import { useMemo } from 'react';

import { getPopulatableChildren } from '../util/formUtil';

import DisabilitiesTable from '@/components/dashboard/enrollments/tables/DisabilitiesTable';
import EnrollmentsTable from '@/components/dashboard/enrollments/tables/EnrollmentsTable';
import HealthAndDvsTable from '@/components/dashboard/enrollments/tables/HealthAndDvsTable';
import IncomeBenefitsTable from '@/components/dashboard/enrollments/tables/IncomeBenefitsTable';
import { ColumnDef } from '@/components/elements/GenericTable';
import { useDashboardClient } from '@/components/pages/ClientDashboard';
import { renderHmisField } from '@/modules/hmis/components/HmisField';
import {
  enrollmentName,
  formatRelativeDate,
  parseAndFormatDate,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import { FormItem, RelatedRecordType } from '@/types/gqlTypes';

export type RelatedRecord = { id: string };
type RelatedRecordWithInformationDate = {
  id: string;
  informationDate: string;
};

export const hasInformationDate = (
  r: RelatedRecord | RelatedRecordWithInformationDate
): r is RelatedRecordWithInformationDate => {
  return r.hasOwnProperty('informationDate');
};

interface Props extends Omit<DialogProps, 'children'> {
  open: boolean;
  item: FormItem;
  recordType: RelatedRecordType;
  onSelected: (record: RelatedRecord) => void;
  onCancel: () => void;
}

const tableComponent = (
  recordType: RelatedRecordType
):
  | typeof IncomeBenefitsTable
  | typeof DisabilitiesTable
  | typeof HealthAndDvsTable
  | typeof EnrollmentsTable
  | null => {
  switch (recordType) {
    case RelatedRecordType.IncomeBenefit:
      return IncomeBenefitsTable;
    case RelatedRecordType.Disability:
      return DisabilitiesTable;
    case RelatedRecordType.HealthAndDv:
      return HealthAndDvsTable;
    case RelatedRecordType.Enrollment:
      return EnrollmentsTable;
    // Enrollment
    // YouthEducationStatus
    // EmploymentEducation
    // CurrentLivingSituation
    // Exit
    default:
      return null;
  }
};

export const getInformationDate = (
  recordType: RelatedRecordType,
  record: any
): string => {
  if (hasInformationDate(record)) return record.informationDate;

  if (recordType === RelatedRecordType.Enrollment) {
    // FIXME not always entry date, figure out how to determine when it was collected
    return record.entryDate;
  }
  return '';
};

const getEnrollmentDetails = (
  recordType: RelatedRecordType,
  record: any
): string | undefined => {
  if (recordType === RelatedRecordType.Enrollment) {
    return enrollmentName(record, true);
  }
  return enrollmentName(record.enrollment, true);
};

const RecordPickerDialog = ({
  onSelected,
  onCancel,
  item,
  recordType,
  open,
  ...other
}: Props) => {
  const { client } = useDashboardClient();

  const columns: ColumnDef<RelatedRecord>[] = useMemo(() => {
    const commonColumns: ColumnDef<RelatedRecord>[] = [
      {
        header: 'Collected On',
        render: (record: RelatedRecord) =>
          parseAndFormatDate(getInformationDate(recordType, record)),
      },
      {
        header: 'Project',
        render: (record: RelatedRecord) =>
          getEnrollmentDetails(recordType, record),
      },
    ];
    if (recordType !== RelatedRecordType.Enrollment) {
      commonColumns.push({
        header: 'Collected By',
        render: 'user.name' as keyof RelatedRecord,
      });
    }

    // Select which fields to show in table based on child items in the group
    const dataColumns = getPopulatableChildren(item).map((i) => ({
      key: i.fieldName || undefined,
      header: i.text || startCase(i.fieldName as string),
      render: renderHmisField(
        HmisEnums.RelatedRecordType[recordType],
        i.fieldName as string
      ),
    }));
    return [
      { header: 'ID', render: 'id' as keyof RelatedRecord },
      ...commonColumns,
      ...dataColumns,
    ];
  }, [item, recordType]);

  const TableComponent = tableComponent(recordType);
  if (!TableComponent) {
    console.error('not implemented', item.recordType);
    return null;
  }

  return (
    <Dialog
      open={open}
      keepMounted={false}
      maxWidth='md'
      // fullWidth
      onClose={onCancel}
      sx={{ '.MuiDialog-paper': { px: 1, overflow: 'hidden', height: '100%' } }}
      {...other}
    >
      <DialogTitle
        typography='h5'
        sx={{ textTransform: 'none' }}
        color='text.primary'
      >
        Choose record for <b>{item.text}</b>
      </DialogTitle>
      <DialogContent sx={{ pb: 0, overflow: 'hidden', height: '100%' }}>
        <TableComponent
          queryVariables={{ id: client.id }}
          defaultPageSize={5}
          columns={columns}
          vertical
          tableProps={{
            size: 'small',
            stickyHeader: true,
            width: 'fit-content',
          }}
          renderVerticalHeaderCell={(record) => {
            const informationDate = getInformationDate(recordType, record);
            const date = parseHmisDateString(informationDate);
            const relativeDate = date ? formatRelativeDate(date) : null;
            return (
              <Stack spacing={2} sx={{ py: 1 }}>
                <Tooltip
                  placement='top'
                  arrow
                  title={parseAndFormatDate(informationDate)}
                  PopperProps={{
                    sx: {
                      '.MuiTooltip-tooltipPlacementTop': {
                        mb: '6px !important',
                      },
                    },
                  }}
                >
                  <Typography
                    variant='body2'
                    textAlign={'center'}
                    fontWeight={600}
                  >
                    {relativeDate}
                  </Typography>
                </Tooltip>

                <Button
                  onClick={() => onSelected(record)}
                  variant='outlined'
                  size='small'
                  sx={{ backgroundColor: 'white' }}
                  fullWidth
                >
                  Select
                </Button>
              </Stack>
            );
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 4, py: 2, justifyContent: 'center' }}>
        <Button onClick={onCancel} variant='gray'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecordPickerDialog;
