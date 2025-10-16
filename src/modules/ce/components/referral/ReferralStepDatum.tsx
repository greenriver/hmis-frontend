import { SvgIconComponent } from '@mui/icons-material';
import { SvgIconProps, SxProps, TypographyProps } from '@mui/material';
import React, { ReactNode } from 'react';
import CommonTextWithIcon from '@/components/elements/CommonTextWithIcon';
import { useIsMobile } from '@/hooks/useIsMobile';

// Component for common styles in the info text for steps
const ReferralStepDatum: React.FC<{
  children: ReactNode;
  sx?: SxProps;
  Icon?: SvgIconComponent;
  IconProps?: SvgIconProps;
  color?: TypographyProps['color'];
}> = ({ children, sx, Icon, color, IconProps }) => {
  const isMobile = useIsMobile('sm');

  return (
    <CommonTextWithIcon
      color={color || 'text.secondary'}
      component={isMobile ? 'p' : 'span'}
      sx={{
        ...sx,
        display: isMobile ? 'flex' : 'inline-flex',
        mr: isMobile ? 0 : 2,
      }}
      Icon={Icon}
      IconProps={IconProps}
    >
      {children}
    </CommonTextWithIcon>
  );
};

export default ReferralStepDatum;
