import { Alert, AlertColor, Typography } from '@mui/material';
import DOMPurify from 'dompurify';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { Component, FormItem } from '@/types/gqlTypes';

interface Props {
  item: FormItem;
  maxWidth?: number;
  viewOnly?: boolean;
}

const SeverityMap: Record<string, AlertColor> = {
  [Component.AlertError]: 'error',
  [Component.AlertSuccess]: 'success',
  [Component.AlertInfo]: 'info',
  [Component.AlertWarning]: 'warning',
};

const DynamicDisplay = ({ item, maxWidth, viewOnly = false }: Props) => {
  const html = useMemo(() => {
    let stringValue = item.text;
    if (viewOnly && !isNil(item.readonlyText)) stringValue = item.readonlyText;
    if (isNil(stringValue)) return undefined;

    return { __html: DOMPurify.sanitize(stringValue) };
  }, [item, viewOnly]);

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
