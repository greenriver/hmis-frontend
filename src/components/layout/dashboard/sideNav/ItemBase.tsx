import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Box, Collapse, IconButton, lighten, Link } from '@mui/material';
import React, {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { NavItem } from './SideNavMenu';
import { useItemSelectionStatus } from './useItemSelectionStatus';

import RouterLink from '@/components/elements/RouterLink';
import { useIsMobile } from '@/hooks/useIsMobile';

export type ItemBaseProps = {
  item: NavItem;
  collapsible?: boolean; // whether children can be collapsed
  renderTitle?: (title: NavItem['title']) => React.ReactNode;
  renderChild?: (item: NavItem) => React.ReactNode;
  showIcon?: boolean;
  itemIndent?: number;
};

const defaultRenderTitle: NonNullable<ItemBaseProps['renderTitle']> = (title) =>
  title;

const ItemBase = ({
  item,
  showIcon = false,
  collapsible = false,
  itemIndent = 0,
  renderTitle = defaultRenderTitle,
  renderChild,
}: ItemBaseProps) => {
  const htmlId = useId();
  const { isSelected, hasItems } = useItemSelectionStatus({ item });

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
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    display: 'block',
    color: isSelected ? 'secondary.main' : 'text.primary',
    fontWeight: isSelected ? 600 : 400,
  };

  const hasTitle = !!item.title;

  return (
    <Box ref={itemRef} id={htmlId}>
      <Box
        onClick={collapsible && hasItems ? handleToggle : undefined}
        role={collapsible && hasItems ? 'button' : undefined}
        sx={{
          display: 'flex',
          cursor: isClickable ? 'pointer' : undefined,
          alignItems: 'center',
          py: hasTitle ? 0.75 : undefined,
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
              ? lighten(theme.palette.secondary.light, 0.85)
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
        <Box sx={{ width: '100%', overflowX: 'hidden' }}>
          {item.href ? (
            <Link
              variant='body1'
              href={item.href || '#'}
              onClick={(e: React.SyntheticEvent) => e.stopPropagation()}
              sx={itemSx}
            >
              {renderTitle(item.title || item.id)}
            </Link>
          ) : item.path ? (
            <RouterLink
              variant='body1'
              to={item.path}
              onClick={(e: React.SyntheticEvent) => e.stopPropagation()}
              sx={itemSx}
              plain
            >
              {renderTitle(item.title || item.id)}
            </RouterLink>
          ) : item.title ? (
            renderTitle(item.title)
          ) : null}
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
            {renderChild &&
              item.items?.map((item) => (
                <React.Fragment key={item.id}>
                  {renderChild(item)}
                </React.Fragment>
              ))}
          </Box>
        </Collapse>
      )}
      {!collapsible && hasItems && (
        <Box sx={{ ml: itemIndent }}>
          {renderChild &&
            item.items?.map((item) => (
              <React.Fragment key={item.id}>{renderChild(item)}</React.Fragment>
            ))}
        </Box>
      )}
    </Box>
  );
};

export default ItemBase;
