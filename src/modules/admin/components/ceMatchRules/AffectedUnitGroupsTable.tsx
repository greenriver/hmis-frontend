import { Box, Typography } from '@mui/material';
import pluralize from 'pluralize';
import { useMemo } from 'react';

import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import { WarningSection } from '@/modules/errors/components/WarningAlert';

// Expected shape of the items returned from the server in `errors[x].data.affectedUnitGroups`.
export interface AffectedUnitGroup {
  id: string;
  unitGroupName: string;
  projectId: string;
  projectName: string;
  currentCandidateCount: number;
  removedCandidateCount: number;
}

const AffectedUnitGroupsTable = ({
  unitGroups,
}: {
  unitGroups: AffectedUnitGroup[];
}) => {
  const columns: ColumnDef<AffectedUnitGroup>[] = useMemo(
    () => [
      {
        header: 'Project',
        key: 'projectName',
        render: 'projectName',
      },
      {
        header: 'Unit Group',
        key: 'unitGroupName',
        render: 'unitGroupName',
      },
      {
        header: 'Currently Eligible',
        key: 'currentCandidateCount',
        textAlign: 'right',
        render: (row) =>
          pluralize('candidate', row.currentCandidateCount, true),
      },
      {
        header: 'Would Be Removed',
        key: 'removedCandidateCount',
        textAlign: 'right',
        render: (row) =>
          pluralize('candidate', row.removedCandidateCount, true),
      },
    ],
    []
  );

  if (unitGroups.length === 0) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <WarningSection
        header={<Typography fontWeight={600}>Affected unit groups</Typography>}
      >
        <Box sx={{ mx: -2, mb: -2 }}>
          <GenericTable
            rows={unitGroups}
            columns={columns}
            rowSx={() => ({ td: { py: 1.5 } })}
          />
        </Box>
      </WarningSection>
    </Box>
  );
};

export default AffectedUnitGroupsTable;
