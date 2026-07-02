import { Chip } from '@mui/material';

const SystemFieldChip: React.FC = ({}) => {
  return (
    <Chip
      label='System Field'
      size='small'
      variant='outlined'
      color='primary'
      aria-label='System field'
      sx={{ fontWeight: 600, height: '20px' }}
    />
  );
};

export default SystemFieldChip;
