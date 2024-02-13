import { Grid, Typography } from '@mui/material';

import { GroupItemComponentProps } from '../../types';
import {
  FormVariantStylesProps,
  getFormGroupVariantStyles,
} from '@/modules/form/components/group/variants';

const HorizontalGroup = ({
  item,
  renderChildItem,
}: GroupItemComponentProps & { horizontal?: boolean }) => {
  const variantStyles: FormVariantStylesProps = item.variant
    ? getFormGroupVariantStyles(item.variant)
    : {};
  const manyChildren = (item.item || []).length > 2;
  const columnGap = manyChildren ? 2 : 4;
  const rowGap = manyChildren ? 1 : 2;
  return (
    <Grid item xs sx={{ ...variantStyles.highlightProps }}>
      {item.text && (
        <Typography sx={{ mb: 2 }} {...variantStyles.titleProps}>
          {item.text}
        </Typography>
      )}
      <Grid container direction='row' columnGap={columnGap} rowGap={rowGap}>
        {renderChildItem &&
          item.item?.map((childItem) => renderChildItem(childItem))}
      </Grid>
    </Grid>
  );
};

export default HorizontalGroup;
