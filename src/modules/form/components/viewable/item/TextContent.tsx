import { ReactNode, useMemo } from 'react';

import NotCollectedText from './NotCollectedText';

import LabelWithContent from '@/components/elements/LabelWithContent';
import MultilineTypography from '@/components/elements/MultilineTypography';
import { hasMeaningfulValue } from '@/modules/form/util/formUtil';

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
  renderValue = (x) => x,
}: TextContentProps<T>): JSX.Element => {
  const displayValue = useMemo(() => {
    if (hasMeaningfulValue(value)) {
      const renderedValue = renderValue(value);
      if (typeof renderedValue === 'string') {
        return (
          <MultilineTypography variant='body2'>
            {renderedValue}
          </MultilineTypography>
        );
      }
      return renderedValue;
    } else {
      return <NotCollectedText variant='body2' />;
    }
  }, [renderValue, value]);

  return (
    <LabelWithContent label={label} horizontal={horizontal}>
      {displayValue}
    </LabelWithContent>
  );
};

export default TextContent;
