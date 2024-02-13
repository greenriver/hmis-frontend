import { Grid, Typography } from '@mui/material';

import { GroupItemComponentProps } from '../../types';
import theme from '@/config/theme';

const Signature = ({ item, renderChildItem }: GroupItemComponentProps) => {
  return (
    <Grid
      item
      xs
      sx={{
        px: 3,
        py: 2,
        borderWidth: '6px',
        borderStyle: 'none none none solid',
        borderColor: theme.palette.primary.main,
        '&:nth-of-type(even)': {
          borderColor: theme.palette.secondary.main,
          '.MuiTypography-h5': { color: theme.palette.secondary.main },
        },
      }}
    >
      {item.text && (
        <Typography
          variant='h5'
          color={theme.palette.primary.main}
          sx={{ mb: 2 }}
        >
          {item.text}
        </Typography>
      )}
      <Grid container direction='row' sx={{ mb: 2 }} columnGap={2}>
        {renderChildItem &&
          item.item?.map((childItem) => renderChildItem(childItem))}
      </Grid>
      <Typography variant='body1'>
        By signing, I do hereby certify that the above information is true,
        accurate and complete to the best of my knowledge
      </Typography>
    </Grid>
  );
};

export default Signature;
