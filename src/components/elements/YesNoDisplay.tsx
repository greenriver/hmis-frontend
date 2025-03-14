import { Typography, TypographyProps } from '@mui/material';
import { isNil } from 'lodash-es';
import React, { ReactNode, useMemo } from 'react';

interface Props extends TypographyProps {
  booleanValue?: boolean | null;
  stringValue?: '0' | '1' | null;
  mode?:
    | 'bi_state' // render null value as "No"
    | 'tri_state'; // render null value as null (or fallback component if provided)
  fallback?: ReactNode; // how to render null/undefined. only for tri_state mode
}

const YesNoDisplay: React.FC<Props> = ({
  booleanValue,
  stringValue,
  fallback,
  mode = 'bi_state',
  ...props
}) => {
  // boolean representation of value
  const value: boolean | null = useMemo(() => {
    // Value is a 'Yes'
    if (booleanValue === true || stringValue === '1') {
      return true;
    }

    // If value is not a "Yes" then its a "No" (two-state mode)
    if (mode === 'bi_state') return false;

    // FOor three-state mode, allow null value
    if (isNil(booleanValue) && isNil(stringValue)) {
      return null;
    }
    return false;
  }, [booleanValue, mode, stringValue]);

  if (value === null) return fallback || null;

  return (
    <Typography variant='body2' color='text.primary' {...props}>
      {value ? 'Yes' : 'No'}
    </Typography>
  );
};

export default YesNoDisplay;
