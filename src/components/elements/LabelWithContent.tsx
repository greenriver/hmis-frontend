import {
  Box,
  InputLabel,
  InputLabelProps,
  BoxProps,
  useTheme,
  Typography,
  Stack,
} from '@mui/material';
import React, { useRef } from 'react';

export type LabelWithContentProps = {
  label?: React.ReactNode;
  labelId?: string;
  LabelProps?: InputLabelProps;
  children?: React.ReactNode;
  renderChildren?: (label: HTMLLabelElement | null) => React.ReactNode;
  helperText?: React.ReactNode;
  horizontal?: boolean;
} & BoxProps;

const LabelWithContent = ({
  children,
  label,
  labelId,
  renderChildren,
  LabelProps = {},
  helperText,
  horizontal = false,
  ...props
}: LabelWithContentProps): JSX.Element => {
  const theme = useTheme();
  const labelRef = useRef<HTMLLabelElement | null>(null);

  const labelContent = (
    <InputLabel
      ref={labelRef}
      {...LabelProps}
      id={labelId}
      sx={{
        color: theme.palette.text.primary,
        fontSize: theme.typography.body2,
        ...LabelProps?.sx,
      }}
    >
      {label}
    </InputLabel>
  );

  const inputContent = (
    <>
      <Box sx={{ marginTop: 0.5 }}>
        {renderChildren ? renderChildren(labelRef.current) : children}
      </Box>
      {helperText && (
        <Typography
          variant='body2'
          color='textSecondary'
          sx={{ fontSize: 12, mt: 0.5 }}
        >
          {helperText}
        </Typography>
      )}
    </>
  );

  return (
    <Box {...props}>
      {horizontal ? (
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          gap={2}
        >
          {labelContent}
          <Box>{inputContent}</Box>
        </Stack>
      ) : (
        <>
          {labelContent}
          {inputContent}
        </>
      )}
    </Box>
  );
};

export default LabelWithContent;
