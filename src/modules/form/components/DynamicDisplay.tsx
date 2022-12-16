import { Alert, AlertColor, Typography } from '@mui/material';
import DOMPurify from 'dompurify';
import { useMemo } from 'react';

import { Component, FormItem } from '@/types/gqlTypes';

interface Props {
  item: FormItem;
  maxWidth?: number;
}

const SeverityMap: Record<string, AlertColor> = {
  [Component.AlertError]: 'error',
  [Component.AlertSuccess]: 'success',
  [Component.AlertInfo]: 'info',
  [Component.AlertWarning]: 'warning',
};

const DynamicDisplay = ({ item, maxWidth }: Props) => {
  const html = useMemo(
    () => (item.text ? { __html: DOMPurify.sanitize(item.text) } : undefined),
    [item]
  );

  if (!html) return null;

  switch (item.component) {
    case Component.AlertError:
    case Component.AlertSuccess:
    case Component.AlertInfo:
    case Component.AlertWarning:
      return (
        <Alert
          severity={SeverityMap[item.component as keyof typeof SeverityMap]}
          sx={{ mt: 2 }}
        >
          <div dangerouslySetInnerHTML={html} />
        </Alert>
      );
    default:
      return (
        <Typography
          variant='body2'
          sx={{ maxWidth }}
          dangerouslySetInnerHTML={html}
        />
      );
  }
};

export default DynamicDisplay;
