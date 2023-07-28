import {
  Button,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import CommonDialog from '@/components/elements/CommonDialog';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { entryExitRange, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import { EnrollmentSummaryFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const baseColumns: ColumnDef<EnrollmentSummaryFieldsFragment>[] = [
  {
    header: 'Enrollment Period',
    render: (e) => entryExitRange(e),
  },
  {
    header: 'Project',
    linkTreatment: true,
    render: (e) => e.projectName,
  },
  {
    header: 'Project Type',
    render: (e) => (
      <HmisEnum value={e.projectType} enumMap={HmisEnums.ProjectType} />
    ),
  },
  {
    header: 'Move in Date',
    render: (e) => parseAndFormatDate(e.moveInDate),
  },
];

const useEnrollmentSummaryDialog = ({
  enrollmentSummary,
  clientId,
}: {
  enrollmentSummary?: EnrollmentSummaryFieldsFragment[];
  clientId?: string;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const closeDialog = useCallback(() => setDialogOpen(() => false), []);
  const openDialog = useCallback(() => setDialogOpen(() => true), []);

  const renderDialog = useCallback(
    (props: Partial<DialogProps> = {}) => {
      if (!enrollmentSummary) return null;

      return (
        <CommonDialog
          fullWidth
          maxWidth='md'
          {...props}
          open={!!dialogOpen}
          onClose={closeDialog}
        >
          <DialogTitle>Open Enrollment Summary</DialogTitle>
          <DialogContent sx={{ my: 2 }}>
            <GenericTable<EnrollmentSummaryFieldsFragment>
              columns={baseColumns}
              rows={enrollmentSummary}
              rowLinkTo={(row) =>
                row.canViewEnrollment && clientId
                  ? generateSafePath(Routes.ENROLLMENT_DASHBOARD, {
                      enrollmentId: row.id,
                      clientId,
                    })
                  : ''
              }
            />
          </DialogContent>
          <DialogActions>
            <Button variant='gray' onClick={closeDialog}>
              Close
            </Button>
          </DialogActions>
        </CommonDialog>
      );
    },
    [closeDialog, dialogOpen, enrollmentSummary, clientId]
  );

  return useMemo(
    () => ({ openDialog, closeDialog, renderDialog }),
    [openDialog, closeDialog, renderDialog]
  );
};

export default useEnrollmentSummaryDialog;
