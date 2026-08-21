import { Chip, Tooltip } from '@mui/material';
import { RestrictedRecordIcon } from '@/components/elements/SemanticIcons';

interface Props {
  iconOnly?: boolean;
}

const RestrictedRecordChip: React.FC<Props> = ({ iconOnly = false }) => {
  if (iconOnly) {
    return (
      <Tooltip title='Restricted Record' arrow placement='right' describeChild>
        <RestrictedRecordIcon fontSize='small' color='warning' />
      </Tooltip>
    );
  }
  return (
    <Chip
      label='Restricted Record'
      icon={<RestrictedRecordIcon fontSize='small' />}
      color='warning'
      sx={{ flexShrink: 0 }}
      variant='status'
    />
  );
};

export default RestrictedRecordChip;
