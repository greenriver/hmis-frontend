import { Alert, AlertColor } from '@mui/material';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { LocalConstants } from '../types';
import CommonHtmlContent from '@/components/elements/CommonHtmlContent';
import { evaluateTemplate } from '@/modules/form/util/expressions/template';
import { Component, FormItem } from '@/types/gqlTypes';

interface Props {
  item: FormItem;
  maxWidth?: number;
  width?: number;
  viewOnly?: boolean;
  value: any;
  localConstants?: LocalConstants;
}

const SeverityMap: Record<string, AlertColor> = {
  [Component.AlertError]: 'error',
  [Component.AlertSuccess]: 'success',
  [Component.AlertInfo]: 'info',
  [Component.AlertWarning]: 'warning',
};

const DynamicDisplay: React.FC<Props> = ({
  item,
  width,
  maxWidth,
  localConstants,
  value = 'N/A',
  viewOnly = false,
}) => {
  const html = useMemo(() => {
    let displayValue = item.text;
    if (viewOnly && !isNil(item.readonlyText)) displayValue = item.readonlyText;
    if (isNil(displayValue)) return undefined;
    // pass local constants to eval context
    return evaluateTemplate(
      displayValue,
      new Map([['value', value], ...Object.entries(localConstants || {})])
    );
  }, [item.text, item.readonlyText, viewOnly, value, localConstants]);

  if (!html) return null;

  switch (item.component) {
    case Component.AlertError:
    case Component.AlertSuccess:
    case Component.AlertInfo:
    case Component.AlertWarning:
      return (
        <Alert
          data-testid={`alert-${item.linkId}`}
          severity={SeverityMap[item.component as keyof typeof SeverityMap]}
          sx={{ mt: 2, width, maxWidth }}
        >
          <CommonHtmlContent>{html}</CommonHtmlContent>
        </Alert>
      );
    default:
      return (
        <CommonHtmlContent
          variant='body2'
          data-testid={`display-${item.linkId}`}
          sx={{ width, maxWidth }}
        >
          {html}
        </CommonHtmlContent>
      );
  }
};

export default DynamicDisplay;
