import { Divider, Stack, Typography } from '@mui/material';

import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import UnitUtilizationChart, {
  UnitVisualizationChartLegend,
} from '@/modules/units/components/UnitUtilizationChart';
import { UnitTypeCapacityFieldsFragment } from '@/types/gqlTypes';

interface Props {
  unitTypes: UnitTypeCapacityFieldsFragment[];
}

// Unit capacity charts grouped by unit type
const UnitUtilizationByUnitType: React.FC<Props> = ({ unitTypes }) => {
  return (
    <>
      <Stack
        gap={2}
        divider={<Divider orientation='horizontal' flexItem />}
        sx={{ mb: 2 }}
      >
        {unitTypes.map((unitType) => (
          <Stack key={unitType.id} gap={0.5} key={unitType.id}>
            <Stack justifyContent={'space-between'} direction='row'>
              <Typography variant='body2' color='text.primary' fontWeight={600}>
                {unitType.unitType}
              </Typography>
              <Stack
                direction='row'
                spacing={1.5}
                divider={
                  <Typography variant='body2' color='text.primary'>
                    •
                  </Typography>
                }
              >
                <CommonLabeledTextBlock title='Total:' horizontal>
                  {unitType.capacity || <>0</>}
                </CommonLabeledTextBlock>
                <CommonLabeledTextBlock title='Occupied:' horizontal>
                  {unitType.capacity - unitType.availability || <>0</>}
                </CommonLabeledTextBlock>
                <CommonLabeledTextBlock title='Vacant:' horizontal>
                  {unitType.availability || <>0</>}
                </CommonLabeledTextBlock>
              </Stack>
            </Stack>

            <UnitUtilizationChart unitType={unitType} />
          </Stack>
        ))}
      </Stack>
      <UnitVisualizationChartLegend />
    </>
  );
};
export default UnitUtilizationByUnitType;
