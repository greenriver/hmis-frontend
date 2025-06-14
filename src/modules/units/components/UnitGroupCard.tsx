import { Box, Paper, Stack, Typography } from '@mui/material';
import ButtonLink from '@/components/elements/ButtonLink';
import UnitUtilizationByUnitType from '@/modules/units/components/UnitUtilizationByUnitType';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { UnitGroupCapacityFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  unitGroup: UnitGroupCapacityFieldsFragment;
  projectId?: string;
  linkToUnitGroup?: boolean;
}

const UnitGroupCard: React.FC<Props> = ({
  unitGroup,
  projectId,
  linkToUnitGroup = false,
}) => {
  return (
    <Paper sx={{ px: 2, pt: 1, pb: 2 }}>
      <Stack
        justifyContent='space-between'
        direction='row'
        alignItems='flex-start'
      >
        <div>
          <Typography component='h2' variant='h5' sx={{ mb: 1 }}>
            <Typography variant='overline' display='block'>
              Unit Group
            </Typography>
            {unitGroup.name}
          </Typography>
        </div>
        {linkToUnitGroup && projectId && (
          <ButtonLink
            aria-label={`View ${unitGroup.name}`}
            to={generateSafePath(ProjectDashboardRoutes.UNIT_GROUP, {
              projectId,
              unitGroupId: unitGroup.id,
            })}
            sx={{ mt: 1 }}
          >
            View
          </ButtonLink>
        )}
      </Stack>
      {unitGroup.capacity > 0 && (
        <>
          <Stack direction='row' gap={2}>
            <Typography variant='body2'>
              <b>Units:</b> {unitGroup.capacity}
            </Typography>
            <Typography variant='body2'>
              <b>Vacancies:</b> {unitGroup.availability}
            </Typography>
          </Stack>
          <Box sx={{ mt: 2 }}>
            <UnitUtilizationByUnitType unitTypes={unitGroup.unitTypes} />
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
