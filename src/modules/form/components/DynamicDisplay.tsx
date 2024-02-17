import { Alert, AlertColor, Typography } from '@mui/material';
import DOMPurify from 'dompurify';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { evaluateTemplate } from '@/modules/form/util/expressions/template';
import { Component, FormItem } from '@/types/gqlTypes';

interface Props {
  item: FormItem;
  maxWidth?: number;
  viewOnly?: boolean;
  value: any;
}

const SeverityMap: Record<string, AlertColor> = {
  [Component.AlertError]: 'error',
  [Component.AlertSuccess]: 'success',
  [Component.AlertInfo]: 'info',
  [Component.AlertWarning]: 'warning',
};

const DynamicDisplay: React.FC<Props> = ({
  item,
  maxWidth,
  value = 'N/A',
  viewOnly = false,
}) => {
  const html = useMemo(() => {
    let displayValue = item.text;
    if (viewOnly && !isNil(item.readonlyText)) displayValue = item.readonlyText;
    if (isNil(displayValue)) return undefined;

    return {
      __html: DOMPurify.sanitize(
        evaluateTemplate(displayValue, new Map([['value', value]]))
      ),
    };
  }, [item, viewOnly, value]);

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
          sx={{ mt: 2 }}
        >
          <div dangerouslySetInnerHTML={html} />
        </Alert>
      );
    default:
      return (
        <Typography
          data-testid={`display-${item.linkId}`}
          variant='body2'
          sx={{ maxWidth }}
          dangerouslySetInnerHTML={html}
        />
      );
  }
};

export default DynamicDisplay;
