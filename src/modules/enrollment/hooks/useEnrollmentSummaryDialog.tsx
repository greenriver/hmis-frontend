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
import {
  EnrollmentSummaryFieldsFragmentFragment,
  GetEnrollmentDetailsQuery,
  ProjectType,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const baseColumns: ColumnDef<EnrollmentSummaryFieldsFragmentFragment>[] = [
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
    render: (e) => {
      const projectTypes = [
        ProjectType.Ph,
        ProjectType.Oph,
        ProjectType.Th,
        ProjectType.Psh,
      ];

      if (projectTypes.includes(e.projectType))
        return parseAndFormatDate(e.moveInDate);

      return null;
    },
  },
];

const useEnrollmentSummaryDialog = ({
  enrollment,
  clientId,
}: {
  enrollment?: GetEnrollmentDetailsQuery['enrollment'];
  clientId: string;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const closeDialog = useCallback(() => setDialogOpen(() => false), []);
  const openDialog = useCallback(() => setDialogOpen(() => true), []);

  const renderDialog = useCallback(
    (props: Partial<DialogProps> = {}) => {
      if (!enrollment) return null;

      return (
        <CommonDialog {...props} open={!!dialogOpen} onClose={closeDialog}>
          <DialogTitle>Open Enrollment Summary</DialogTitle>
          <DialogContent sx={{ my: 2 }}>
            <GenericTable<EnrollmentSummaryFieldsFragmentFragment>
              columns={baseColumns}
              rows={enrollment.openEnrollmentSummary}
              rowLinkTo={(row) =>
                row.canViewEnrollment && row.primaryKey
                  ? generateSafePath(Routes.ENROLLMENT_DASHBOARD, {
                      enrollmentId: row.primaryKey,
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
    [closeDialog, dialogOpen, enrollment, clientId]
  );

  return useMemo(
    () => ({ openDialog, closeDialog, renderDialog }),
    [openDialog, closeDialog, renderDialog]
  );
};

export default useEnrollmentSummaryDialog;
