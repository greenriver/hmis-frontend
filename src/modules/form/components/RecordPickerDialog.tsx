import { Stack } from '@mui/material';
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
import RelativeDate from '@/components/elements/RelativeDate';
import { useDashboardClient } from '@/components/pages/ClientDashboard';
import { renderHmisField } from '@/modules/hmis/components/HmisField';
import { enrollmentName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
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

export const tableComponentForType = (
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
    case RelatedRecordType.DisabilityGroup:
      return DisabilitiesTable;
    case RelatedRecordType.HealthAndDv:
      return HealthAndDvsTable;
    case RelatedRecordType.Enrollment:
      return EnrollmentsTable;
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
    ];
    if (recordType !== RelatedRecordType.Enrollment) {
      commonColumns.push({
        header: 'Collected By',
        render: 'user.name' as keyof RelatedRecord,
      });
      commonColumns.push({
        header: 'Collection Stage',
        render: renderHmisField(
          HmisEnums.RelatedRecordType[recordType],
          'dataCollectionStage'
        ),
      });
    }
    commonColumns.push({
      header: 'Project',
      render: (record: RelatedRecord) =>
        getEnrollmentDetails(recordType, record),
    });
    if (
      import.meta.env.MODE === 'development' &&
      recordType !== RelatedRecordType.DisabilityGroup
    ) {
      commonColumns.unshift({
        header: 'ID',
        render: 'id' as keyof RelatedRecord,
      });
    }

    // Select which fields to show in table based on child items in the group
    const dataColumns = getPopulatableChildren(item).map((i) => ({
      key: i.fieldName || undefined,
      header: i.briefText || i.text || startCase(i.fieldName as string),
      render: renderHmisField(
        HmisEnums.RelatedRecordType[recordType],
        i.fieldName as string
      ),
    }));
    return [...commonColumns, ...dataColumns];
  }, [item, recordType]);

  const TableComponent = tableComponentForType(recordType);
  if (!TableComponent) {
    console.error('not implemented', item.recordType);
    return null;
  }

  return (
    <Dialog
      open={open}
      keepMounted={false}
      maxWidth='lg'
      fullWidth
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
      <DialogContent sx={{ pb: 6, overflow: 'hidden', height: '100%' }}>
        <TableComponent
          queryVariables={{ id: client.id }}
          defaultPageSize={5}
          columns={columns}
          nonTablePagination
          vertical
          tableProps={{
            size: 'small',
            stickyHeader: true,
            width: 'fit-content',
          }}
          renderVerticalHeaderCell={(record) => {
            const informationDate = getInformationDate(recordType, record);
            return (
              <Stack spacing={2} sx={{ py: 1 }}>
                <RelativeDate
                  dateString={informationDate}
                  variant='body2'
                  textAlign={'center'}
                  fontWeight={600}
                  withTooltip
                />
                <Button
                  onClick={() => onSelected(record)}
                  variant='outlined'
                  size='small'
                  sx={{ backgroundColor: 'white' }}
                  fullWidth
                  aria-label={`Select record from ${informationDate}`}
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
