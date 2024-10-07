import { Box, lighten, Stack, Typography } from '@mui/material';
import pluralize from 'pluralize';
import { useMemo } from 'react';

import Loading from '@/components/elements/Loading';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import {
  UnitTypeCapacityFieldsFragment,
  useGetProjectUnitTypesQuery,
} from '@/types/gqlTypes';

const LabeledNumber = ({
  number,
  label,
}: {
  number: number;
  label: string;
}) => {
  return (
    <Stack direction='row' gap={0.75} alignItems='end'>
      <Typography>
        <b>{number}</b>
      </Typography>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
    </Stack>
  );
};

const CapacityProgressBar = ({ percentFilled }: { percentFilled: number }) => {
  const baseColor = useMemo(() => {
    if (percentFilled === 0) return '#c9c9c9'; // gray
    if (percentFilled <= 25) return '#8BC34A'; // green
    if (percentFilled <= 80) return '#1976D2'; // blue
    return '#FB8C00'; // orange
  }, [percentFilled]);

  return (
    <Stack
      direction='row'
      sx={{
        backgroundColor: lighten(baseColor, 0.7),
        height: '14px',
        minWidth: '200px',
        maxWidth: '350px',
        mr: 3,
      }}
    >
      <Box
        sx={{ backgroundColor: baseColor, width: `${percentFilled}%` }}
      ></Box>
    </Stack>
  );
};

const UnitCapacityTable = ({ projectId }: { projectId: string }) => {
  const { data, error, loading } = useGetProjectUnitTypesQuery({
    variables: { id: projectId },
    fetchPolicy: 'cache-and-network',
  });
  const columns: ColumnDef<UnitTypeCapacityFieldsFragment>[] = [
    {
      key: 'unitType',
      render: (row: UnitTypeCapacityFieldsFragment) => (
        <Box sx={{ py: 1, pl: 2 }}>
          <b>{row.unitType}</b>
        </Box>
      ),
    },
    {
      key: 'capacity',
      render: (row: UnitTypeCapacityFieldsFragment) => (
        <LabeledNumber
          number={row.capacity}
          label={pluralize('unit', row.capacity)}
        />
      ),
    },
    {
      key: 'filled',
      render: (row: UnitTypeCapacityFieldsFragment) => (
        <>
          <LabeledNumber
            number={row.capacity - row.availability}
            label='filled'
          />
        </>
      ),
    },
    {
      key: 'available',
      render: (row: UnitTypeCapacityFieldsFragment) => (
        <LabeledNumber number={row.availability} label='available' />
      ),
    },
    {
      key: 'progress',
      render: (row: UnitTypeCapacityFieldsFragment) => (
        <CapacityProgressBar
          percentFilled={
            ((row.capacity - row.availability) / row.capacity) * 100
          }
        />
      ),
    },
  ];

  if (loading && !data) return <Loading />;
  if (error) throw error;

  const rows = data?.project?.unitTypes || [];
  if (rows.length === 0) {
    return (
      <Typography pb={3} textAlign='center'>
        No units
      </Typography>
    );
  }
  return (
    <GenericTable<UnitTypeCapacityFieldsFragment>
      rows={rows}
      columns={columns}
    />
  );
};
export default UnitCapacityTable;
