import { Box } from '@mui/system';
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
  return (
    <Box sx={{ width: '100%' }}>
      <UnitUtilizationByUnitType unitTypes={rows} variant='grid' />
    </Box>
  );
};
export default UnitCapacityTable;
