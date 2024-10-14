import { Card, Collapse } from '@mui/material';
import React, { useState } from 'react';
import { STAFF_ASSIGNMENT_COLUMNS } from './StaffAssignmentTable';
import ExpandInfoButton from '@/components/elements/ExpandInfoButton';
import Loading from '@/components/elements/Loading';
import GenericTable from '@/components/elements/table/GenericTable';
import {
  StaffAssignmentDetailsFragment,
  useGetHouseholdStaffAssignmentHistoryLazyQuery,
} from '@/types/gqlTypes';

interface StaffAssignmentHistoryProps {
  householdId: string;
}
const StaffAssignmentHistory: React.FC<StaffAssignmentHistoryProps> = ({
  householdId,
}) => {
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const [getHistory, { data, loading, error }] =
    useGetHouseholdStaffAssignmentHistoryLazyQuery({
      variables: { id: householdId },
    });

  if (error) throw error;

  return (
    <>
      <ExpandInfoButton
        expanded={historyExpanded}
        onClick={() => {
          getHistory();
          setHistoryExpanded(!historyExpanded);
        }}
      >
        Show staff assignment history
      </ExpandInfoButton>
      <Collapse in={historyExpanded}>
        <Card>
          {loading && <Loading />}
          {!loading && data?.household?.staffAssignments && (
            <GenericTable<StaffAssignmentDetailsFragment>
              rows={data.household.staffAssignments.nodes || []}
              columns={[
                STAFF_ASSIGNMENT_COLUMNS.staffName,
                STAFF_ASSIGNMENT_COLUMNS.role,
                STAFF_ASSIGNMENT_COLUMNS.assignmentDateRange,
              ]}
              noData={'No Assignment History'}
              tableProps={{ 'aria-label': 'Staff assignment history' }}
            />
          )}
        </Card>
      </Collapse>
    </>
  );
};

export default StaffAssignmentHistory;
