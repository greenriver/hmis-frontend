import { ReactNode, isValidElement, useMemo } from 'react';

import LabelWithContent from '@/components/elements/LabelWithContent';
import MultilineTypography from '@/components/elements/MultilineTypography';
import NotCollectedText from '@/components/elements/NotCollectedText';
import {
  hasMeaningfulValue,
  isDataNotCollected,
} from '@/modules/form/util/formUtil';

export interface TextContentProps<T extends ReactNode> {
  label: ReactNode;
  value: T;
  horizontal?: boolean;
  hasValue?: (value: T) => boolean;
  renderValue?: (value: T) => ReactNode;
  'data-testid'?: string;
}

const TextContent = <T extends ReactNode>({
  label,
  value,
  horizontal = false,
  renderValue = (x) => x,
  ...props
}: TextContentProps<T>): JSX.Element => {
  const testId = props['data-testid'];
  const displayValue = useMemo(() => {
    if (hasMeaningfulValue(value) && !isDataNotCollected(value)) {
      const renderedValue = renderValue(value);
      if (isValidElement(renderedValue)) return renderedValue;

      return (
        <MultilineTypography variant='body2' data-testid={testId}>
          {renderedValue}
        </MultilineTypography>
      );
    } else {
      return (
        <NotCollectedText variant='body2' data-testid={testId}>
          Data not collected
        </NotCollectedText>
      );
    }
  }, [renderValue, value, testId]);

  return (
    <LabelWithContent
      label={label}
      horizontal={horizontal}
      data-testid={testId}
    >
      {displayValue}
    </LabelWithContent>
  );
};

export default TextContent;
