import { Chip } from '@mui/material';

const HudChip: React.FC = ({}) => {
  return (
    <Chip
      label='HUD'
      size='small'
      variant='outlined'
      color='primary'
      aria-label='HUD field'
      sx={{ fontWeight: 600, height: '20px' }}
    />
  );
};

export default HudChip;
