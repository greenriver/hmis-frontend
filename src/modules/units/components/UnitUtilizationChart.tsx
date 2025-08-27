import { Box, Stack, Typography } from '@mui/material';

interface Props {
  occupied: number;
  vacant: number;
  // TODO(#7796) add category for units with a referral in progress
  // referralInProgress: number;
}

const occupiedColor = 'primary.main';
const inProgressColor = 'primary.dark';
const vacantColor = 'primary.200';

export const UnitVisualizationChart: React.FC<Props> = ({
  occupied,
  vacant,
}) => {
  const referralInProgress = 0; // TODO(#7796) add category for units with a referral in progress
  const total = vacant + occupied + referralInProgress;

  return (
    <Box>
      <Stack
        direction='row'
        sx={{
          backgroundColor: 'background.paper',
          height: '12px',
          borderRadius: '4px',
          overflow: 'hidden',
          width: '100%',
          alignItems: 'center',
          '.MuiTypography-root': {
            pl: 1,
            display: 'table-cell',
            verticalAlign: 'middle',
            lineHeight: 'inherit',
            fontWeight: 'bold',
          },
        }}
      >
        <Box
          sx={{
            backgroundColor: occupiedColor,
            width: `${(occupied / total) * 100}%`,
          }}
        >
          <Box sx={{ visibility: 'hidden' }}>{occupied}</Box>
        </Box>
        <Box
          sx={{
            backgroundColor: inProgressColor,
            width: `${(referralInProgress / total) * 100}%`,
          }}
        >
          <Box sx={{ visibility: 'hidden' }}>{referralInProgress}</Box>
        </Box>
        <Box
          sx={{
            backgroundColor: vacantColor,
            width: `${(vacant / total) * 100}%`,
          }}
        >
          <Box sx={{ visibility: 'hidden' }}>{vacant}</Box>
        </Box>
      </Stack>
    </Box>
  );
};

export const UnitVisualizationChartLegend: React.FC = () => {
  const indicatorSx = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  };
  return (
    <Stack direction='row' spacing={2} sx={{ mt: 1 }}>
      <Stack direction='row' alignItems='center' spacing={1}>
        <Box sx={{ backgroundColor: occupiedColor, ...indicatorSx }} />
        <Typography variant='body2'>Occupied</Typography>
      </Stack>
      {/* <Stack direction='row' alignItems='center' spacing={1}>
        <Box sx={{ backgroundColor: inProgressColor, ...indicatorSx }} />
        <Typography variant='body2'>Referral In-Progress</Typography>
      </Stack> */}
      <Stack direction='row' alignItems='center' spacing={1}>
        <Box sx={{ backgroundColor: vacantColor, ...indicatorSx }} />
        <Typography variant='body2'>Vacant</Typography>
      </Stack>
    </Stack>
  );
};

export default UnitVisualizationChart;
