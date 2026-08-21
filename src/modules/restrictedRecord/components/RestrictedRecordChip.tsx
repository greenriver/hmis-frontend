import { Chip, Tooltip } from '@mui/material';
import { RestrictedRecordIcon } from '@/components/elements/SemanticIcons';

interface Props {
  iconOnly?: boolean;
}

const RestrictedRecordChip: React.FC<Props> = ({ iconOnly = false }) => {
  if (iconOnly) {
    return (
      <Tooltip title='Restricted Record' arrow placement='right'>
        <RestrictedRecordIcon
          fontSize='small'
          color='warning'
          aria-label='Restricted Record'
        />
      </Tooltip>
    );
  }
  return (
    <Chip
      label='Restricted Record'
      icon={<RestrictedRecordIcon fontSize='small' />}
      color='warning'
      data-testid='restrictedRecordChip'
      sx={{ flexShrink: 0 }}
      variant='status'
    />
  );
};

export default RestrictedRecordChip;
