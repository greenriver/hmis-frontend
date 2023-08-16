import { Link } from '@mui/material';
import React from 'react';
import useEnrollmentSummaryDialog from '../hooks/useEnrollmentSummaryDialog';
import { EnrollmentSummaryFieldsFragment } from '@/types/gqlTypes';

export interface Props {
  enrollmentSummary?: EnrollmentSummaryFieldsFragment[];
  clientId?: string;
}

const EnrollmentSummaryCount: React.FC<Props> = ({
  enrollmentSummary,
  clientId,
}) => {
  const { openDialog, renderDialog } = useEnrollmentSummaryDialog({
    enrollmentSummary,
    clientId,
  });

  if (!enrollmentSummary) return null;
  if (enrollmentSummary.length < 1) return <>0</>;

  return (
    <>
      <Link component='button' onClick={openDialog}>
        {enrollmentSummary.length}
      </Link>
      {renderDialog()}
    </>
  );
};

export default EnrollmentSummaryCount;
