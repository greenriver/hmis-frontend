import { Box, Paper, Stack, Typography } from '@mui/material';
import CommonMenuButton, {
  CommonMenuItem,
} from '@/components/elements/CommonMenuButton';
import { CapacityProgressBar } from '@/modules/units/components/UnitCapacityTable';
import { UnitGroupCapacityFieldsFragment } from '@/types/gqlTypes';

interface Props {
  unitGroup: UnitGroupCapacityFieldsFragment;
  menuItems?: CommonMenuItem[];
}

const UnitGroupCard: React.FC<Props> = ({ unitGroup, menuItems }) => {
  return (
    <Paper sx={{ px: 2, pt: 1, pb: 2 }}>
      <Stack
        justifyContent='space-between'
        direction='row'
        alignItems='flex-start'
      >
        <div>
          <Typography variant='overline'>Unit Group</Typography>
          <Typography variant='h5' sx={{ mb: 1 }}>
            {unitGroup.name}
          </Typography>
        </div>
        {menuItems && menuItems.length > 0 && (
          <CommonMenuButton
            iconButton
            title='Actions'
            items={menuItems}
            ButtonProps={{
              'aria-label': `Action menu for ${unitGroup.name}`,
              sx: { mr: -1 },
            }}
          />
        )}
      </Stack>
      {unitGroup.capacity > 0 && (
        <>
          <Typography variant='body2'>
            <b>Units:</b> {unitGroup.capacity}
          </Typography>
          <Typography variant='body2'>
            <b>Availability:</b> {unitGroup.availability} units available
          </Typography>
          <Typography variant='body2'>
            <b>Utilization:</b> {unitGroup.utilization || 0}% occupancy
          </Typography>
          <Box sx={{ mt: 2 }}>
            <CapacityProgressBar percentFilled={unitGroup.utilization || 0} />
          </Box>
        </>
      )}
      {unitGroup.capacity === 0 && (
        <Typography variant='body2' color='text.secondary'>
          No units in group.
        </Typography>
      )}
    </Paper>
  );
};
export default UnitGroupCard;
