import { Typography } from '@mui/material';
import { ReactNode, useMemo } from 'react';

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
  const displayValue = useMemo(() => {
    if (hasValue(value)) {
      const renderedValue = renderValue(value);
      if (typeof renderedValue === 'string')
        return <Typography variant='body2'>{renderedValue}</Typography>;
      return renderedValue;
    } else {
      return <NotCollectedText variant='body2' />;
    }
  }, [hasValue, renderValue, value]);

  return (
    <LabelWithContent label={label} horizontal={horizontal}>
      {displayValue}
    </LabelWithContent>
  );
};

export default TextContent;
