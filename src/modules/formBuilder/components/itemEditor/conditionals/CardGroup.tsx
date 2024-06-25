import { Button, IconButton } from '@mui/material';
import { Box, Stack } from '@mui/system';
import React, { ReactNode } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { AddIcon, CloseIcon } from '@/components/elements/SemanticIcons';

interface RemovableCardProps {
  children: ReactNode;
  onRemove: VoidFunction;
  removeTooltip?: string;
}
export const RemovableCard: React.FC<RemovableCardProps> = ({
  children,
  onRemove,
  removeTooltip,
}) => {
  return (
    <Box
      gap={2}
      sx={{
        border: '1px solid white',
        borderRadius: 1,
        borderColor: 'borders.light',
        mb: 1,
        position: 'relative',
      }}
      p={2}
    >
      {children}
      <Box component='span' sx={{ position: 'absolute', right: 4, top: 4 }}>
        <ButtonTooltipContainer title={removeTooltip}>
          <IconButton onClick={onRemove} size='small'>
            <CloseIcon fontSize='small' />
          </IconButton>
        </ButtonTooltipContainer>
      </Box>
    </Box>
  );
};

interface CardGroupProps {
  children: ReactNode;
  onAddItem: VoidFunction;
  addItemText: string;
  maxItems?: number;
}
const CardGroup: React.FC<CardGroupProps> = ({
  children,
  onAddItem,
  addItemText,
  maxItems,
}) => {
  return (
    <Box>
      <Stack gap={2} sx={{ pt: 1 }}>
        {children}
      </Stack>
      {(!maxItems ||
        (Array.isArray(children) && children.length < maxItems)) && (
        <Button
          onClick={onAddItem}
          color='secondary'
          variant='text'
          sx={{ width: 'fit-content', color: 'links' }}
          startIcon={<AddIcon />}
        >
          {addItemText}
        </Button>
      )}
    </Box>
  );
};
export default CardGroup;
