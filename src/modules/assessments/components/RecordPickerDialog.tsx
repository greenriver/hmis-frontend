import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { visuallyHidden } from '@mui/utils';
import { startCase } from 'lodash-es';
import { ReactNode, useMemo } from 'react';

import CommonDialog from '@/components/elements/CommonDialog';
import RelativeDate from '@/components/elements/RelativeDate';
import { ColumnDef } from '@/components/elements/table/types';
import AssessmentsForPopulationTable from '@/modules/assessments/components/AssessmentsForPopulationTable';
import { AssessmentForPopulation } from '@/modules/form/types';
import {
  getFieldOnAssessment,
  getPopulatableChildren,
} from '@/modules/form/util/formUtil';
import {
  ASSESSMENT_COLUMNS,
  assessmentColumns,
} from '@/modules/form/util/recordPickerUtil';
import HmisField from '@/modules/hmis/components/HmisField';
import { AssessmentRole, FormItem, FormRole } from '@/types/gqlTypes';

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
  const actionColumnDef: ColumnDef<AssessmentForPopulation> = useMemo(() => {
    return {
      key: 'Action',
      render: (record: AssessmentForPopulation) => (
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
      ),
    };
  }, [onSelected]);

  const columns: ColumnDef<AssessmentForPopulation>[] = useMemo(() => {
    // If no item was passed, that means we're pre-filling the entire assessment.
    // Only metadata columns are shown in that case.
    if (!item) return [actionColumnDef, ...assessmentColumns];

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
          if (!record || !recordType) return;

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
    return [actionColumnDef, ...assessmentColumns, ...dataColumns];
  }, [actionColumnDef, item]);

  const hudRoles = [
    AssessmentRole.Intake,
    AssessmentRole.Update,
    AssessmentRole.Exit,
    AssessmentRole.Annual,
    AssessmentRole.PostExit,
  ];

  return (
    <CommonDialog
      open={open}
      keepMounted={false}
      maxWidth='lg'
      fullWidth
      onClose={onCancel}
      sx={{
        '.MuiDialog-paper': { overflow: 'hidden' },
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
          pb: 2,
          my: 0,
        }}
      >
        {description}
        <AssessmentsForPopulationTable
          queryVariables={{ id: clientId, roles: hudRoles }}
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
              <>
                <Box sx={visuallyHidden}>
                  {/* Additional visually hidden info about this assessment to help with accessibility when navigating the table */}
                  {ASSESSMENT_COLUMNS.CollectionStage.render(record)}
                </Box>
                <RelativeDate
                  dateString={record.assessmentDate}
                  dateUpdated={record.dateUpdated || undefined}
                  variant='body2'
                  textAlign={'center'}
                  fontWeight={600}
                  withTooltip
                  prefix='Assessment Date: '
                />
              </>
            );
          }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button onClick={onCancel} color='grayscale'>
          Close
        </Button>
      </DialogActions>
    </CommonDialog>
  );
};

export default RecordPickerDialog;
