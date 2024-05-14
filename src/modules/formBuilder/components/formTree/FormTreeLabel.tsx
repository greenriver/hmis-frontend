import { Badge, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { TreeItem2Label } from '@mui/x-tree-view';
import React from 'react';
import theme from '@/config/theme';
import { FormItemDisplay } from '@/modules/formBuilder/components/formTree/types';

interface FormTreeLabelProps {
  children?: React.ReactNode;
  question?: FormItemDisplay;
  required?: boolean;
}
const FormTreeLabel: React.FC<FormTreeLabelProps> = ({
  question,
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
      {question && (
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
              color: question.textColor,
              backgroundColor: question.backgroundColor,
              borderRadius: '4px 0 0 4px',
              mr: 2,
              p: 1, // TODO - This styling is inflexible, looks bad when the label text is long
            }}
          >
            <Box
              component={question.icon}
              className='labelIcon'
              color='inherit'
              sx={{ fontSize: '1.2rem' }}
            />
            <Typography variant='caption'>{question.text}</Typography>
          </Stack>
        </Badge>
      )}
      {children}
    </TreeItem2Label>
  );
};

export default FormTreeLabel;
