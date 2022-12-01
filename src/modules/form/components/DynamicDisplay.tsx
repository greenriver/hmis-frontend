import { Alert, Typography } from '@mui/material';
import DOMPurify from 'dompurify';
import { useMemo } from 'react';

import { Component, FormItem } from '@/types/gqlTypes';

interface Props {
  item: FormItem;
  maxWidth?: number;
}

const DynamicDisplay = ({ item, maxWidth }: Props) => {
  const html = useMemo(
    () => (item.text ? { __html: DOMPurify.sanitize(item.text) } : undefined),
    [item]
  );

  if (!html) return null;

  switch (item.component) {
    case Component.WarningAlert:
      return (
        <Alert severity='warning'>
          <div dangerouslySetInnerHTML={html} />
        </Alert>
      );
    default:
      return (
        <Typography
          variant='body2'
          sx={{ mt: 4, maxWidth }}
          dangerouslySetInnerHTML={html}
        />
      );
  }
};

export default DynamicDisplay;
