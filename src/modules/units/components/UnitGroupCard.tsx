import { CardActionArea, Paper, Typography } from '@mui/material';
import RouterLink from '@/components/elements/RouterLink';
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
  const content = (
    <Paper sx={{ px: 2, pt: 1, pb: 2 }}>
      <Typography
        component='h2'
        variant='h5'
        sx={{ mb: 1, whiteSpace: 'initial' }} // wrap text
      >
        <Typography variant='overline' display='block'>
          Unit Group
        </Typography>
        {unitGroup.name}
      </Typography>
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
        aria-label={`Manage Unit Group ${unitGroup.name}`}
      >
        {content}
      </CardActionArea>
    );
  }
  return content;
};
export default UnitGroupCard;
