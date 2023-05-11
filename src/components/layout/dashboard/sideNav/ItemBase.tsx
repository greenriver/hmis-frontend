import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Box, Collapse, IconButton, lighten, Link } from '@mui/material';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

import { NavItem } from './types';
import { useItemSelectionStatus } from './useItemSelectionStatus';

import RouterLink from '@/components/elements/RouterLink';
import { useIsMobile } from '@/hooks/useIsMobile';

export type ItemBaseProps = {
  item: NavItem;
  collapsible?: boolean; // whether children can be collapsed
  renderTitle?: (title: NavItem['title']) => React.ReactNode;
  renderChild?: (item: NavItem) => React.ReactNode;
  itemIndent?: number;
};

const defaultRenderTitle: NonNullable<ItemBaseProps['renderTitle']> = (title) =>
  title;

const ItemBase = ({
  item,
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
    py: 1,
    px: 3,
    textDecoration: 'none',
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    display: 'block',
    color: isSelected ? 'secondary.main' : 'text.primary',
    fontWeight: isSelected ? 600 : 400,
    '&.Mui-focusVisible': {
      outlineOffset: '-2px',
    },
  };

  return (
    <Box ref={itemRef} id={htmlId}>
      <Box
        onClick={collapsible && hasItems ? handleToggle : undefined}
        role={collapsible && hasItems ? 'button' : undefined}
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
            isSelected
              ? lighten(theme.palette.secondary.light, 0.85)
              : undefined,
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
                id={`side-nav-${item.id}`}
                variant='body1'
                href={item.href || '#'}
                aria-label={item.title as string}
                sx={itemSx}
              >
                {renderTitle(item.title || item.id)}
              </Link>
            ) : item.path ? (
              <RouterLink
                id={`side-nav-${item.id}`}
                data-testid={`sideNav-${item.id}`}
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
        {collapsible && hasItems && (
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
