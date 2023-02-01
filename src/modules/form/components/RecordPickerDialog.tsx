import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { startCase } from 'lodash-es';
import { ReactNode, useMemo } from 'react';

import { getPopulatableChildren } from '../util/formUtil';
import {
  getRecordPickerColumns,
  isAssessment,
  isEnrollment,
  isTypicalRelatedRecord,
  PopulatableSourceRecordType,
  RelatedRecord,
} from '../util/recordPickerUtil';

import AssessmentsForPopulationTable from '@/components/dashboard/enrollments/tables/AssessmentsForPopulationTable';
import DisabilitiesTable from '@/components/dashboard/enrollments/tables/DisabilitiesTable';
import EnrollmentsTable from '@/components/dashboard/enrollments/tables/EnrollmentsTable';
import HealthAndDvsTable from '@/components/dashboard/enrollments/tables/HealthAndDvsTable';
import IncomeBenefitsTable from '@/components/dashboard/enrollments/tables/IncomeBenefitsTable';
import { ColumnDef } from '@/components/elements/GenericTable';
import RelativeDate from '@/components/elements/RelativeDate';
import { useDashboardClient } from '@/components/pages/ClientDashboard';
import { renderHmisField } from '@/modules/hmis/components/HmisField';
import { HmisEnums } from '@/types/gqlEnums';
import { AssessmentRole, FormItem, RelatedRecordType } from '@/types/gqlTypes';

interface Props extends Omit<DialogProps, 'children'> {
  open: boolean;
  item?: FormItem;
  recordType: PopulatableSourceRecordType;
  description?: ReactNode;
  onSelected: (record: RelatedRecord) => void;
  onCancel: () => void;
  role?: AssessmentRole;
}

export const tableComponentForType = (
  recordType: PopulatableSourceRecordType
):
  | typeof IncomeBenefitsTable
  | typeof DisabilitiesTable
  | typeof HealthAndDvsTable
  | typeof EnrollmentsTable
  | typeof AssessmentsForPopulationTable
  | null => {
  switch (recordType) {
    // YouthEducationStatus
    // EmploymentEducation
    // CurrentLivingSituation
    // Exit
    case RelatedRecordType.IncomeBenefit:
      return IncomeBenefitsTable;
    case RelatedRecordType.DisabilityGroup:
      return DisabilitiesTable;
    case RelatedRecordType.HealthAndDv:
      return HealthAndDvsTable;
    case RelatedRecordType.Enrollment:
      return EnrollmentsTable;
    case 'Assessment':
      return AssessmentsForPopulationTable;
    default:
      return null;
  }
};

const RecordPickerDialog = ({
  onSelected,
  onCancel,
  item,
  recordType,
  open,
  role,
  description,
  ...other
}: Props) => {
  const { client } = useDashboardClient();

  const columns: ColumnDef<RelatedRecord>[] = useMemo(() => {
    const metadataColumns: ColumnDef<RelatedRecord>[] =
      getRecordPickerColumns(recordType);

    if (!item) return metadataColumns;

    // Select which fields to show in table based on child items in the group
    const dataColumns = getPopulatableChildren(item)
      .filter((item) => !item.hidden)
      .map((i) => ({
        key: i.fieldName || undefined,
        header: i.briefText || i.text || startCase(i.fieldName as string),
        render: renderHmisField(
          HmisEnums.RelatedRecordType[recordType as RelatedRecordType],
          i.fieldName as string
        ),
      }));
    return [...metadataColumns, ...dataColumns];
  }, [item, recordType]);

  const TableComponent = tableComponentForType(recordType);
  if (!TableComponent) {
    console.error('not implemented', item?.recordType);
    return null;
  }
  // Need to set height on the dialog in order for the scrolling to work
  const height = `${Math.min(columns.length * 60 + 250, 850)}px`;

  return (
    <Dialog
      open={open}
      keepMounted={false}
      maxWidth='lg'
      fullWidth
      onClose={onCancel}
      sx={{
        '.MuiDialog-paper': { px: 1, overflow: 'hidden', height },
      }}
      {...other}
    >
      <DialogTitle
        typography='h5'
        sx={{ textTransform: 'none' }}
        color='text.primary'
      >
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
          overflow: 'hidden',
          height: '100%', // need for scrolling
        }}
      >
        {description}
        <TableComponent
          queryVariables={{
            id: client.id,
            ...(role ? { roles: [role], inProgress: false } : undefined),
          }}
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
            const dateUpdated = isTypicalRelatedRecord(record)
              ? record.dateUpdated
              : undefined;

            const informationDate = isTypicalRelatedRecord(record)
              ? record.informationDate
              : isEnrollment(record)
              ? record.entryDate
              : isAssessment(record)
              ? record.assessmentDate
              : '';

            return (
              <Stack spacing={2} sx={{ py: 1 }}>
                <RelativeDate
                  dateString={dateUpdated || informationDate}
                  variant='body2'
                  textAlign={'center'}
                  fontWeight={600}
                  withTooltip
                  prefix='Last Updated on '
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
