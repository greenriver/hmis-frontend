import {
  Box,
  InputLabel,
  InputLabelProps,
  BoxProps,
  useTheme,
} from '@mui/material';
import React, { useRef } from 'react';

export type LabelWithContentProps = {
  label?: React.ReactNode;
  labelId?: string;
  LabelProps?: InputLabelProps;
  children?: React.ReactNode;
  renderChildren?: (label: HTMLLabelElement | null) => React.ReactNode;
} & BoxProps;

const LabelWithContent = ({
  children,
  label,
  labelId,
  renderChildren,
  LabelProps = {},
  ...props
}: LabelWithContentProps): JSX.Element => {
  const theme = useTheme();
  const labelRef = useRef<HTMLLabelElement | null>(null);
  return (
    <Box {...props}>
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
      <Box sx={{ marginTop: 0.5 }}>
        {renderChildren ? renderChildren(labelRef.current) : children}
      </Box>
    </Box>
  );
};

export default LabelWithContent;
