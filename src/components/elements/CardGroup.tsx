import { Button, IconButton } from '@mui/material';
import { Box, Stack, SxProps } from '@mui/system';
import React, { ReactNode } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { AddIcon, CloseIcon } from '@/components/elements/SemanticIcons';

interface RemovableCardProps {
  children: ReactNode;
  // If onRemove is not provided, disable removal. Used e.g. when parent wants to disable removal if only one card remains
  onRemove?: VoidFunction;
  removeTooltip?: string;
  additionalActions?: ReactNode; // Extra action elements rendered to the left of the Remove button
  sx?: SxProps;
}

/**
 * A card that can be removed from a CardGroup. Optionally allows extra actions to be rendered to the left of the Remove button.
 */
export const RemovableCard: React.FC<RemovableCardProps> = ({
  children,
  onRemove,
  removeTooltip,
  additionalActions,
  sx,
}) => {
  return (
    <Box
      gap={2}
      sx={{
        border: '1px solid white',
        borderRadius: 1,
        borderColor: 'borders.light',
        position: 'relative',
        ...sx,
      }}
      p={2}
    >
      {children}
      {(onRemove || additionalActions) && (
        <Stack
          direction='row'
          alignItems='center'
          sx={{ position: 'absolute', right: 4, top: 4 }}
        >
          {additionalActions}
          {onRemove && (
            <ButtonTooltipContainer title={removeTooltip}>
              <IconButton
                onClick={onRemove}
                size='small'
                aria-label={removeTooltip || 'Remove'}
              >
                <CloseIcon fontSize='small' />
              </IconButton>
            </ButtonTooltipContainer>
          )}
        </Stack>
      )}
    </Box>
  );
};

interface CardGroupProps {
  children: ReactNode;
  onAddItem: VoidFunction;
  addItemText: string;
  maxItems?: number;
  disableAdd?: boolean;
}

/**
 * A group of cards that can be added to and removed from.
 */
const CardGroup: React.FC<CardGroupProps> = ({
  children,
  onAddItem,
  addItemText,
  maxItems,
  disableAdd = false,
}) => {
  return (
    <Box>
      <Stack gap={2} sx={{ pt: 1 }}>
        {children}
        {!disableAdd &&
          (!maxItems ||
            (Array.isArray(children) && children.length < maxItems)) && (
            <Button
              onClick={onAddItem}
              variant='text'
              sx={{ width: 'fit-content' }}
              startIcon={<AddIcon />}
            >
              {addItemText}
            </Button>
          )}
      </Stack>
    </Box>
  );
};

export default CardGroup;
