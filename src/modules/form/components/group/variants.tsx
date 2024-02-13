import { SvgIconComponent } from '@mui/icons-material';
import { TypographyProps } from '@mui/material';
import { SxProps } from '@mui/system';
import { SignatureIcon } from '@/components/elements/SemanticIcons';
import theme from '@/config/theme';
import { Variant } from '@/types/gqlTypes';

export interface FormVariantStylesProps {
  icon?: SvgIconComponent;
  titleProps?: TypographyProps;
  helperTextProps?: TypographyProps;
  highlightProps?: SxProps;
}
export const getFormGroupVariantStyles = (
  variant: Variant
): FormVariantStylesProps => {
  switch (variant) {
    case Variant.Signature:
      return {
        icon: SignatureIcon,
        titleProps: { color: 'primary', variant: 'h3', fontWeight: 600 },
        helperTextProps: { variant: 'body1' },
      };
    case Variant.Highlight:
      return {
        titleProps: {
          variant: 'h5',
          color: theme.palette.primary.main,
        },
        highlightProps: {
          px: 3,
          py: 2,
          borderWidth: '6px',
          borderStyle: 'none none none solid',
          borderColor: theme.palette.primary.main,
          '&:nth-child(even)': {
            borderColor: theme.palette.secondary.main,
            '.MuiTypography-h5': { color: theme.palette.secondary.main },
          },
        },
      };
    default:
      return {};
  }
};
