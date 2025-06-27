import { SvgIconComponent } from '@mui/icons-material';
import { SvgIconProps, Typography, TypographyProps } from '@mui/material';
import React, { ReactNode } from 'react';

export interface CommonTextWithIconProps extends TypographyProps {
  children: ReactNode;
  Icon?: SvgIconComponent;
  IconProps?: SvgIconProps;
}

const CommonTextWithIcon: React.FC<CommonTextWithIconProps> = ({
  children,
  Icon,
  IconProps,
  ...props
}) => {
  const { sx, ...typographyProps } = props;

  return (
    <Typography
      variant='body2'
      component='span'
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        ...sx,
      }}
      {...typographyProps}
    >
      {Icon && <Icon fontSize='inherit' color='inherit' {...IconProps} />}
      {children}
    </Typography>
  );
};

export default CommonTextWithIcon;
