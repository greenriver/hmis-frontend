import { Chip, ChipProps, Tooltip, Typography } from '@mui/material';

import { briefProjectType } from '../hmisUtil';

import { HmisEnums } from '@/types/gqlEnums';
import { ProjectType } from '@/types/gqlTypes';

interface Props extends ChipProps {
  projectType?: ProjectType | null;
}

const ProjectTypeChip = ({ projectType, ...props }: Props) => {
  if (!projectType) return null;
  const label = HmisEnums.ProjectType[projectType];
  if (!label) return null;

  return (
    <Tooltip
      title={<Typography variant='body2'>{label}</Typography>}
      placement='right'
      arrow
    >
      <Chip
        label={briefProjectType(projectType)}
        size='small'
        variant='outlined'
        {...props}
        sx={{ cursor: 'inherit', ...props.sx }}
      />
    </Tooltip>
  );
};

export default ProjectTypeChip;
