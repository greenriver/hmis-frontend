import { Typography } from '@mui/material';
import { ReactNode } from 'react';

import NotCollectedText from './NotCollectedText';

import LabelWithContent from '@/components/elements/LabelWithContent';

export interface TextContentProps<T extends ReactNode> {
  label: ReactNode;
  value: T;
  horizontal?: boolean;
  hasValue?: (value: T) => boolean;
  renderValue?: (value: T) => ReactNode;
}

const TextContent = <T extends ReactNode>({
  label,
  value,
  horizontal = false,
  hasValue = (x) => !!x,
  renderValue = (x) => x,
}: TextContentProps<T>): JSX.Element => {
  return (
    <LabelWithContent label={label} horizontal={horizontal}>
      {hasValue(value) ? (
        typeof value === 'string' ? (
          <Typography variant='body2'>{renderValue(value)}</Typography>
        ) : (
          renderValue(value)
        )
      ) : (
        <NotCollectedText variant='body2' />
      )}
    </LabelWithContent>
  );
};

export default TextContent;
