import { Box, Typography } from '@mui/material';
import pluralize from 'pluralize';
import { useMemo } from 'react';

import { AffectedUnitGroup } from './ceMatchRuleUtil';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import { WarningSection } from '@/modules/errors/components/WarningAlert';

type Row = AffectedUnitGroup & { id: string };

const AffectedUnitGroupsTable = ({
  unitGroups,
}: {
  unitGroups: AffectedUnitGroup[];
}) => {
  const rows = useMemo(
    () => unitGroups.map((group) => ({ ...group, id: group.unitGroupId })),
    [unitGroups]
  );

  const columns: ColumnDef<Row>[] = useMemo(
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
            rows={rows}
            columns={columns}
            rowSx={() => ({ td: { py: 1.5 } })}
          />
        </Box>
      </WarningSection>
    </Box>
  );
};

export default AffectedUnitGroupsTable;
