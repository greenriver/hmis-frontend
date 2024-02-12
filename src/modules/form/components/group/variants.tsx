import { Draw, SvgIconComponent } from '@mui/icons-material';
import { TypographyProps } from '@mui/material';
import theme from '@/config/theme';
import { Variant } from '@/types/gqlTypes';

export interface FormVariantStylesProps {
  icon?: SvgIconComponent;
  titleProps?: TypographyProps;
  subtitleProps?: TypographyProps;
  themeColorFn?: (i: number) => string;
}
export const getFormGroupVariantStyles = (
  variant?: Variant | null
): FormVariantStylesProps => {
  switch (variant) {
    case Variant.Signature:
      return {
        icon: Draw,
        titleProps: { color: 'primary', variant: 'h3', fontWeight: 600 },
        subtitleProps: { variant: 'body1' },
        themeColorFn: (i: number) =>
          i % 2 === 0
            ? theme.palette.primary.main
            : theme.palette.secondary.main,
      };
    default:
      return {};
  }
};
