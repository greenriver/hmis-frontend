import { Box, lighten, Stack } from '@mui/material';
import { useMemo } from 'react';

import GenericTable, { ColumnDef } from '@/components/elements/GenericTable';
import Loading from '@/components/elements/Loading';
import {
  UnitTypeCapacityFieldsFragment,
  useGetProjectUnitTypesQuery,
} from '@/types/gqlTypes';

const CapacityProgressBar = ({
  percentAvailable,
}: {
  percentAvailable: number;
}) => {
  const baseColor = useMemo(() => {
    if (percentAvailable == 100) return '#F9F9F9'; // gray
    if (percentAvailable >= 50) return '#8BC34A'; // green
    return '#FB8C00'; // orange
  }, [percentAvailable]);

  return (
    <Stack
      direction='row'
      sx={{
        backgroundColor: lighten(baseColor, 0.5),
        height: '14px',
        width: '200px',
      }}
    >
      <Box
        sx={{ backgroundColor: baseColor, width: `${percentAvailable}%` }}
      ></Box>
    </Stack>
  );
};

const UnitCapacityTable = ({ projectId }: { projectId: string }) => {
  const { data, error, loading } = useGetProjectUnitTypesQuery({
    variables: { id: projectId },
  });
  const columns: ColumnDef<UnitTypeCapacityFieldsFragment>[] = [
    {
      key: 'unitType',
      render: (row: UnitTypeCapacityFieldsFragment) => (
        <Box sx={{ py: 1 }}>
          <b>{row.unitType}</b>
        </Box>
      ),
    },
    {
      key: 'capacity',
      render: (row: UnitTypeCapacityFieldsFragment) => (
        <Stack>
          {row.availability}/{row.capacity} units available
        </Stack>
      ),
    },
    {
      key: 'availability',
      render: (row: UnitTypeCapacityFieldsFragment) => (
        <CapacityProgressBar
          percentAvailable={(row.availability / row.capacity) * 100}
        />
      ),
    },
  ];

  if (loading && !data) return <Loading />;
  if (error) throw error;

  return (
    <GenericTable<UnitTypeCapacityFieldsFragment>
      rows={data?.project?.unitTypes || []}
      columns={columns}
    />
  );
};
export default UnitCapacityTable;
