import { Divider, Paper, Stack, Typography } from '@mui/material';
import ButtonLink from '@/components/elements/ButtonLink';
import UnitUtilizationByUnitType from '@/modules/units/components/UnitUtilizationByUnitType';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { UnitGroupCapacityFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  unitGroup: UnitGroupCapacityFieldsFragment;
  projectId?: string;
  linkToUnitGroup?: boolean;
  hideTitle?: boolean;
}

const UnitGroupCard: React.FC<Props> = ({
  unitGroup,
  projectId,
  linkToUnitGroup = false,
  hideTitle = false,
}) => {
  const hasMultipleUnitTypes = unitGroup.unitTypes.length > 1;
  return (
    <Paper sx={{ px: 2, pt: hideTitle ? 2 : 1, pb: 2 }}>
      {!hideTitle && (
        <Stack
          justifyContent='space-between'
          direction='row'
          alignItems='flex-start'
          sx={{ mb: 1 }}
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
              size='small'
            >
              Manage
            </ButtonLink>
          )}
        </Stack>
      )}
      {unitGroup.capacity > 0 && (
        <>
          {hasMultipleUnitTypes && (
            <>
              <Stack direction='row' gap={2}>
                <Typography variant='body2'>
                  <b>Total Units:</b> {unitGroup.capacity}
                </Typography>
                <Typography variant='body2'>
                  <b>Vacancies:</b> {unitGroup.availability}
                </Typography>
              </Stack>
              <Divider sx={{ my: 2 }} />
            </>
          )}
          <UnitUtilizationByUnitType unitTypes={unitGroup.unitTypes} />
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
