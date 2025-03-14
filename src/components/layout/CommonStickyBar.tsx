import { AppBar, AppBarProps } from '@mui/material';
import React, { useMemo } from 'react';
import { CONTEXT_HEADER_HEIGHT, STICKY_BAR_HEIGHT } from './layoutConstants';
import { useIsMobile } from '@/hooks/useIsMobile';

type Props = AppBarProps & {
  top?: number;
  height?: number;
  isStickyOnMobile?: boolean;
};

/**
 * Used when we need a sticky bar at the top of the screen below the app header, including
 * - the nav bar containing breadcrumbs
 * - sticky headers inside of dashboard content
 *
 * Can be stacked, with the help of the `top` prop.
 *
 * Uses MUI's AppBar internally, but overrides the component so it's just a `div` and not a `header`
 */
const CommonStickyBar: React.FC<Props> = ({
  height,
  top = STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT,
  isStickyOnMobile = false,
  sx,
  children,
  ...rest
}) => {
  const mobile = useIsMobile();
  const sticky = useMemo(
    () => !mobile || isStickyOnMobile,
    [mobile, isStickyOnMobile]
  );

  return (
    <AppBar
      component='div'
      position={sticky ? 'sticky' : 'static'}
      color='default'
      sx={{
        height: sticky ? height : undefined,
        top: sticky ? top : undefined,
        backgroundColor: 'white',
        borderTop: 'unset',
        borderLeft: 'unset',
        borderRight: 'unset',
        borderBottomWidth: '1px',
        borderBottomColor: 'borders.light',
        borderBottomStyle: 'solid',
        px: 3,
        py: 2,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </AppBar>
  );
};
export default CommonStickyBar;
