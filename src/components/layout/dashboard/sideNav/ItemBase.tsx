import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Box, Collapse, IconButton, lighten, Link } from '@mui/material';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { NavItem } from './types';
import { useItemSelectionStatus } from './useItemSelectionStatus';

import RouterLink from '@/components/elements/RouterLink';
import { useIsMobile } from '@/hooks/useIsMobile';

export type ItemBaseProps<T> = {
  item: NavItem<T>;
  collapsible?: boolean; // whether children can be collapsed
  renderTitle?: (title: ReactNode) => ReactNode;
  renderChild?: (item: NavItem<T>) => ReactNode;
  itemIndent?: number;
};

const defaultRenderTitle = (title: ReactNode) => title;

const ItemBase = <T extends object>({
  item,
  collapsible = false,
  itemIndent = 0,
  renderTitle = defaultRenderTitle,
  renderChild,
}: ItemBaseProps<T>) => {
  const htmlId = useId();
  const { isSelected, childItems, hasChildItems } = useItemSelectionStatus({
    item,
  });

  const [open, setOpen] = useState<boolean>(
    (isSelected && hasChildItems) || false
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

  const isClickable = collapsible || !hasChildItems;
  const itemSx = {
    py: 1,
    px: 3,
    textDecoration: 'none',
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    display: 'block',
    color: isSelected ? 'primary.main' : 'text.primary',
    fontWeight: isSelected ? 600 : 400,
    '&.Mui-focusVisible': {
      outlineOffset: '-2px',
    },
  };

  return (
    <Box ref={itemRef} id={htmlId}>
      <Box
        onClick={collapsible && hasChildItems ? handleToggle : undefined}
        role={collapsible && hasChildItems ? 'button' : undefined}
        sx={{
          display: 'flex',
          cursor: isClickable ? 'pointer' : undefined,
          alignItems: 'center',
          transition: 'background-color 0.2s',
          '&:hover':
            isClickable && !isSelected
              ? {
                  backgroundColor: '#fafafa',
                }
              : undefined,
          backgroundColor: (theme) =>
            isSelected ? lighten(theme.palette.primary.light, 0.9) : undefined,
        }}
      >
        {item.title && (
          <Box
            sx={{
              width: '100%',
              overflowX: 'hidden',
              border: '2px solid transparent',
              // do the padding inside the link if possible so we get the whole click target
              p: item.href || item.path ? undefined : 1,
            }}
          >
            {item.href ? (
              <Link
                id={`side-nav-${item.id}-${htmlId}`}
                variant='body1'
                href={item.href || '#'}
                aria-label={item.title as string}
                sx={itemSx}
              >
                {renderTitle(item.title || item.id)}
              </Link>
            ) : item.path ? (
              <RouterLink
                id={`side-nav-${item.id}-${htmlId}`}
                data-testid={`sideNav-${item.id}-${htmlId}`}
                aria-label={item.title}
                variant='body1'
                to={item.path}
                sx={itemSx}
                plain
              >
                {renderTitle(item.title || item.id)}
              </RouterLink>
            ) : (
              renderTitle(item.title)
            )}
          </Box>
        )}
        {collapsible && hasChildItems && (
          <Box
            sx={{
              transition: 'transform 0.1s',
              transform: `rotate(${open ? '90' : '0'}deg)`,
            }}
          >
            <IconButton
              onClick={handleToggle}
              aria-label={item.title as string}
              size='small'
              sx={{
                '&.Mui-focusVisible': {
                  outlineOffset: '-2px',
                },
              }}
            >
              <KeyboardArrowRightIcon fontSize='small' />
            </IconButton>
          </Box>
        )}
      </Box>
      {collapsible && hasChildItems && (
        <Collapse in={open}>
          <Box sx={{ ml: itemIndent + 2 }}>
            {renderChild &&
              childItems.map((item) => (
                <React.Fragment key={item.id}>
                  {renderChild(item)}
                </React.Fragment>
              ))}
          </Box>
        </Collapse>
      )}
      {!collapsible && hasChildItems && (
        <Box sx={{ ml: itemIndent }}>
          {renderChild &&
            childItems.map((item) => (
              <React.Fragment key={item.id}>{renderChild(item)}</React.Fragment>
            ))}
        </Box>
      )}
    </Box>
  );
};

export default ItemBase;
