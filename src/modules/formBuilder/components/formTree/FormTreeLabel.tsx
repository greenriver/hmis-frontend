import { Badge, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { TreeItem2Label } from '@mui/x-tree-view';
import React from 'react';
import theme from '@/config/theme';
import { FormItemPaletteType } from '@/modules/formBuilder/components/formTree/types';

interface FormTreeLabelProps {
  children?: React.ReactNode;
  displayAttrs?: FormItemPaletteType;
  required?: boolean;
}
const FormTreeLabel: React.FC<FormTreeLabelProps> = ({
  displayAttrs,
  children,
  required,
  ...other
}) => {
  return (
    <TreeItem2Label
      {...other}
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {displayAttrs && (
        <Badge
          invisible={!required}
          badgeContent={'*'}
          sx={{
            '& .MuiBadge-badge': {
              fontWeight: 700,
              color: theme.palette.error.main,
              backgroundColor: theme.palette.background.default,
              borderStyle: 'solid',
              borderWidth: 1,
              borderColor: theme.palette.borders.dark,
              transform: 'scale(1) translate(-30%, -30%)',
              // TODO: weird visual interaction with required badge when the Tree elements are expanded/contracted
            },
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <Stack
            sx={{
              width: 90,
              alignItems: 'center',
              color: displayAttrs.textColor,
              backgroundColor: displayAttrs.backgroundColor,
              borderRadius: '4px 0 0 4px',
              mr: 2,
              p: 1, // TODO - This styling is inflexible, looks bad when the label text is long
            }}
          >
            <Box
              component={displayAttrs.IconClass}
              className='labelIcon'
              color='inherit'
              sx={{ fontSize: '1.2rem' }}
            />
            <Typography variant='caption'>
              {displayAttrs.displayName}
            </Typography>
          </Stack>
        </Badge>
      )}
      {children}
    </TreeItem2Label>
  );
};

export default FormTreeLabel;
