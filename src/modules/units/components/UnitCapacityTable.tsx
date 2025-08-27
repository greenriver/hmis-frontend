import { Divider } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import UnitUtilizationByUnitType from '@/modules/units/components/UnitUtilizationByUnitType';
import { useGetProjectUnitTypesQuery } from '@/types/gqlTypes';

const UnitCapacityTable = ({ projectId }: { projectId: string }) => {
  const { data, error, loading } = useGetProjectUnitTypesQuery({
    variables: { id: projectId },
    fetchPolicy: 'cache-and-network',
  });

  if (loading && !data) return <Loading />;
  if (error) throw error;

  const rows = data?.project?.unitTypes || [];
  if (rows.length === 0) {
    return null;
  }
  const total = data?.project?.unitTypes
    .map((type) => type.capacity)
    .reduce((acc, capacity) => acc + capacity, 0);
  const vacancies = data?.project?.unitTypes
    .map((type) => type.availability)
    .reduce((acc, availability) => acc + availability, 0);

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
        <CommonLabeledTextBlock title='Total Units:' horizontal>
          {total}
        </CommonLabeledTextBlock>
        <CommonLabeledTextBlock title='Vacancies:' horizontal>
          {vacancies}
        </CommonLabeledTextBlock>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <UnitUtilizationByUnitType unitTypes={rows} />
    </Box>
  );
};
export default UnitCapacityTable;
