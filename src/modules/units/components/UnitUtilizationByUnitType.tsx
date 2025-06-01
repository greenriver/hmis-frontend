import { Stack, Typography } from '@mui/material';

import UnitUtilizationChart, {
  UnitVisualizationChartLegend,
} from '@/modules/units/components/UnitUtilizationChart';
import { UnitTypeCapacityFieldsFragment } from '@/types/gqlTypes';

interface Props {
  unitTypes: UnitTypeCapacityFieldsFragment[];
}

// Unit capacity charts grouped by unit type
const UnitUtilizationByUnitType: React.FC<Props> = ({ unitTypes }) => {
  const hasMultipleUnitTypes = unitTypes.length > 1;

  return (
    <Stack gap={1}>
      {unitTypes.map((unitType) => (
        <Stack gap={0.25}>
          {hasMultipleUnitTypes && (
            <Typography variant='body2' color='text.secondary'>
              {unitType.unitType}
            </Typography>
          )}
          <UnitUtilizationChart unitType={unitType} />
        </Stack>
      ))}
      <UnitVisualizationChartLegend />
    </Stack>
  );
};
export default UnitUtilizationByUnitType;
