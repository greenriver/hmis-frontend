import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Box,
  Collapse,
  IconButton,
  lighten,
  Link,
  Typography,
} from '@mui/material';
import React, {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { getHtmlIdForItem, NavItem } from '../SideNavMenu';

import { useItemSelectionStatus } from './useItemSelectionStatus';

import RouterLink from '@/components/elements/RouterLink';
import { useIsMobile } from '@/hooks/useIsMobile';

export type ItemBaseProps = {
  item: NavItem;
  collapsible?: boolean; // whether children can be collapsed
  renderTitle?: (
    title: NavItem['title'],
    selected?: boolean
  ) => React.ReactNode;
  renderChild: (
    item: NavItem,
    selected?: string | null | undefined
  ) => React.ReactNode;
  showIcon?: boolean;
  selected?: string | undefined | null;
  itemIndent?: number;
};

export const StandardText: React.FC<{
  fontWeight?: number;
  selectedFontWeight?: number;
  title: NavItem['title'];
  selected?: boolean;
}> = ({ fontWeight = 600, selectedFontWeight = 700, selected, title }) => (
  <Typography
    component='span'
    variant='inherit'
    sx={{
      fontWeight: selected ? selectedFontWeight : fontWeight,
      opacity: selected ? 1 : 0.85,
    }}
  >
    {title}
  </Typography>
);

const defaultRenderTitle: NonNullable<ItemBaseProps['renderTitle']> = (title) =>
  title;

export const SideNavMenuMenuItemBase: React.FC<ItemBaseProps> = ({
  item,
  selected,
  showIcon = false,
  collapsible = false,
  itemIndent = 0,
  renderTitle = defaultRenderTitle,
  renderChild,
}) => {
  const { isSelected, hasItems } = useItemSelectionStatus({
    item,
    selected,
  });

  const [open, setOpen] = useState<boolean>(
    (isSelected && hasItems) || false
    // isActive || (isSelected && hasItems) || false
  );

  const handleToggle = useCallback(
    (evt: React.MouseEvent, value?: boolean) => {
      setOpen(value === undefined ? !open : value);
    },
    [open, setOpen]
  );

  const isMobile = useIsMobile();
  const itemRef = useRef<HTMLDivElement>();
  useEffect(() => {
    if (isMobile && isSelected) {
      itemRef.current?.scrollIntoView();
    }
  }, [isSelected, isMobile]);

  const isClickable = collapsible || !hasItems;
  const itemSx = {
    py: 0.5,
    px: 2,
    textDecoration: 'none',
    color: 'inherit',
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    display: 'block',
  };

  return (
    <Box ref={itemRef} id={getHtmlIdForItem(item)}>
      <Box
        onClick={collapsible && hasItems ? handleToggle : undefined}
        role={collapsible && hasItems ? 'button' : undefined}
        sx={{
          display: 'flex',
          cursor: isClickable ? 'pointer' : undefined,
          alignItems: 'center',
          py: 0.75,
          // pr: 0.75,
          // pl: 2,
          // gap: 1,
          transition: 'background-color 0.2s',
          // borderRadius: '1000px',
          '&:hover':
            isClickable && !isSelected
              ? {
                  backgroundColor: '#fafafa',
                }
              : undefined,
          backgroundColor: (theme) =>
            isSelected
              ? lighten(theme.palette.secondary.light, 0.9)
              : undefined,
        }}
      >
        {showIcon && (
          <Box
            sx={{
              fontSize: 14,
              display: 'flex',
              color: isSelected ? '#0060F0' : '#9E9E9E',
            }}
          >
            {item.icon && cloneElement(item.icon, { fontSize: 'inherit' })}
          </Box>
        )}
        <Box
          // className={clsx({
          //   selected: isSelected || isDirectChildSelected,
          //   active: isActive,
          // })}
          sx={{
            width: '100%',
            overflowX: 'hidden',
            '&.selected': {
              color: '#0060F0',
            },
          }}
        >
          {item.href ? (
            <Link
              variant='body1'
              href={item.href || '#'}
              onClick={(e: React.SyntheticEvent) => e.stopPropagation()}
              sx={itemSx}
            >
              {renderTitle(item.title || item.id, isSelected)}
            </Link>
          ) : item.path ? (
            <RouterLink
              variant='body1'
              to={item.path}
              onClick={(e: React.SyntheticEvent) => e.stopPropagation()}
              sx={itemSx}
              plain
            >
              {/* {item.title} */}
              {renderTitle(item.title || item.id, isSelected)}
            </RouterLink>
          ) : (
            renderTitle(item.title || item.id, isSelected)
          )}
        </Box>
        {collapsible && hasItems && (
          <Box
            sx={{
              transition: 'transform 0.1s',
              transform: `rotate(${open ? '90' : '0'}deg)`,
            }}
          >
            <IconButton onClick={handleToggle} size='small'>
              <KeyboardArrowRightIcon fontSize='small' />
            </IconButton>
          </Box>
        )}
      </Box>
      {collapsible && hasItems && (
        <Collapse in={open}>
          <Box sx={{ ml: itemIndent + 2 }}>
            {item.items?.map((item) => (
              <React.Fragment key={item.id}>
                {renderChild(item, selected)}
              </React.Fragment>
            ))}
          </Box>
        </Collapse>
      )}
      {!collapsible && hasItems && (
        <Box sx={{ ml: itemIndent }}>
          {item.items?.map((item) => (
            <React.Fragment key={item.id}>
              {renderChild(item, selected)}
            </React.Fragment>
          ))}
        </Box>
      )}
    </Box>
  );
};
