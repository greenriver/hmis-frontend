import { Typography } from '@mui/material';
import { ReactNode } from 'react';

import NotCollectedText from './NotCollectedText';

import LabelWithContent from '@/components/elements/LabelWithContent';

export interface TextContentProps<T extends ReactNode> {
  label: ReactNode;
  value: T;
  hasValue?: (value: T) => boolean;
  renderValue?: (value: T) => ReactNode;
}

const TextContent = <T extends ReactNode>({
  label,
  value,
  hasValue = (x) => !!x,
  renderValue = (x) => x,
}: TextContentProps<T>): JSX.Element => {
  return (
    <LabelWithContent label={label}>
      {hasValue(value) ? (
        typeof value === 'string' ? (
          <Typography>{renderValue(value)}</Typography>
        ) : (
          renderValue(value)
        )
      ) : (
        <NotCollectedText />
      )}
    </LabelWithContent>
  );
};

export default TextContent;
