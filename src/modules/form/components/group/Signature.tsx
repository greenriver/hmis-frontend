import { Grid, Stack, Typography } from '@mui/material';

import { GroupItemComponentProps } from '../../types';
import theme from '@/config/theme';
import { useIsMobile } from '@/hooks/useIsMobile';
import { maxWidthAtNestingLevel } from '@/modules/form/util/formUtil';

// Group component for rendering 1 person's signature.
// Usually has String and Date items as children (signature & date signed).
const Signature = ({
  item,
  renderChildItem,
  nestingLevel,
  viewOnly,
}: GroupItemComponentProps) => {
  const defaultHelperText =
    'By typing my name in the box above, I understand that I am signing this form electronically. I agree that this form of electronic signature is the legal equivalent of my manual signature.';

  const isMobile = useIsMobile();
  const maxWidth: number | string = isMobile
    ? '100%'
    : maxWidthAtNestingLevel(nestingLevel + 1);

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
        <Stack gap={2} maxWidth={maxWidth}>
          {item.text && (
            <Typography
              variant='h5'
              color={theme.palette.primary.main}
              component='legend'
            >
              {item.text}
            </Typography>
          )}
          <Grid container direction='row' columnGap={viewOnly ? 6 : 2}>
            {renderChildItem &&
              item.item?.map((childItem) => renderChildItem(childItem))}
          </Grid>
          {!viewOnly && (
            <Typography variant='body2'>
              {item.helperText ? item.helperText : defaultHelperText}
            </Typography>
          )}
        </Stack>
      </fieldset>
    </Grid>
  );
};

export default Signature;
