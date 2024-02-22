import { Grid, Stack, Typography } from '@mui/material';

import { GroupItemComponentProps } from '../../types';
import theme from '@/config/theme';

// Group component for rendering 1 person's signature.
// Usually has String and Date items as children (signature & date signed).
const Signature = ({
  item,
  renderChildItem,
  viewOnly,
}: GroupItemComponentProps) => {
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
      <fieldset style={{ border: 'none', margin: 'none', padding: 'none' }}>
        <Stack gap={2}>
          {item.text && (
            <legend>
              <Typography variant='h5' color={theme.palette.primary.main}>
                {item.text}
              </Typography>
            </legend>
          )}
          <Grid container direction='row' columnGap={viewOnly ? 6 : 2}>
            {renderChildItem &&
              item.item?.map((childItem) => renderChildItem(childItem))}
          </Grid>
          {!viewOnly && (
            <Typography variant='body2'>
              By signing, I do hereby certify that the above information is
              true, accurate and complete to the best of my knowledge
            </Typography>
          )}
        </Stack>
      </fieldset>
    </Grid>
  );
};

export default Signature;
