import {
  CardActionArea,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ButtonLink from '@/components/elements/ButtonLink';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import RouterLink from '@/components/elements/RouterLink';
import { SettingsIcon } from '@/components/elements/SemanticIcons';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { UnitGroupCapacityFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  unitGroup: UnitGroupCapacityFieldsFragment;
  projectId?: string;
  linkToUnitGroup?: boolean;
  hideTitle?: boolean;
  includeUtilizationChart?: boolean;
}

const UnitGroupCard: React.FC<Props> = ({
  unitGroup,
  projectId,
  linkToUnitGroup = false,
}) => {
  const content = (
    <Paper sx={{ px: 2, pt: 1, pb: 2 }}>
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
          <ButtonTooltipContainer title='Manage Unit Group'>
            <IconButton
              aria-label={`Manage ${unitGroup.name}`}
              component={ButtonLink}
              to={generateSafePath(ProjectDashboardRoutes.UNIT_GROUP, {
                projectId,
                unitGroupId: unitGroup.id,
              })}
              size='small'
              sx={{ mt: 1, borderRadius: 1 }}
            >
              <SettingsIcon />
            </IconButton>
          </ButtonTooltipContainer>
        )}
      </Stack>

      {unitGroup.capacity > 0 && (
        <Typography variant='body2' color='text.secondary'>
          {unitGroup.availability} / {unitGroup.capacity} units vacant
        </Typography>
      )}
      {unitGroup.capacity === 0 && (
        <Typography variant='body2' color='text.secondary'>
          No units in group.
        </Typography>
      )}
    </Paper>
  );

  if (linkToUnitGroup) {
    return (
      <CardActionArea
        component={RouterLink}
        to={generateSafePath(ProjectDashboardRoutes.UNIT_GROUP, {
          projectId,
          unitGroupId: unitGroup.id,
        })}
        aria-label='Manage Unit Group'
      >
        {content}
      </CardActionArea>
    );
  }
  return content;
};
export default UnitGroupCard;
