import { SvgIconComponent } from '@mui/icons-material';
import { SxProps, TypographyProps } from '@mui/material';
import React, { ReactNode } from 'react';
import CommonTextWithIcon from '@/components/elements/CommonTextWithIcon';
import { useIsMobile } from '@/hooks/useIsMobile';

// Component for common styles in the info text for steps
const ReferralStepDatum: React.FC<{
  children: ReactNode;
  sx?: SxProps;
  Icon?: SvgIconComponent;
  color?: TypographyProps['color'];
}> = ({ children, sx, Icon, color }) => {
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
    >
      {children}
    </CommonTextWithIcon>
  );
};

export default ReferralStepDatum;
