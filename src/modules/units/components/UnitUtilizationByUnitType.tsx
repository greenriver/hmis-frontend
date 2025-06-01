import { Grid, Stack, Typography } from '@mui/material';

import UnitUtilizationChart, {
  UnitVisualizationChartLegend,
} from '@/modules/units/components/UnitUtilizationChart';
import { UnitTypeCapacityFieldsFragment } from '@/types/gqlTypes';

interface Props {
  unitTypes: UnitTypeCapacityFieldsFragment[];
  variant?: 'stacked' | 'grid';
}

// Unit capacity charts grouped by unit type
const UnitUtilizationByUnitType: React.FC<Props> = ({
  unitTypes,
  variant = 'stacked',
}) => {
  const hasMultipleUnitTypes = unitTypes.length > 1;

  return (
    <Stack gap={1}>
      {unitTypes.map((unitType, idx) =>
        variant === 'stacked' ? (
          <Stack gap={0.25}>
            {hasMultipleUnitTypes && (
              <Typography variant='body2' color='text.secondary'>
                {unitType.unitType}
              </Typography>
            )}
            <UnitUtilizationChart unitType={unitType} />
          </Stack>
        ) : (
          <Grid container>
            <Grid item xs={3}>
              <Typography variant='body1' color='text.primary'>
                {unitType.unitType}
              </Typography>
            </Grid>
            <Grid item xs={9}>
              <UnitUtilizationChart unitType={unitType} />
              {idx === unitTypes.length - 1 && <UnitVisualizationChartLegend />}
            </Grid>
          </Grid>
        )
      )}
      {variant === 'stacked' && <UnitVisualizationChartLegend />}
    </Stack>
  );
};
export default UnitUtilizationByUnitType;
