import { Typography, TypographyProps } from '@mui/material';
import DOMPurify from 'dompurify';
import { useMemo } from 'react';

interface Props extends TypographyProps {
  children: string;
  component: React.ElementType;
}
const CommonHtmlContent: React.FC<Props> = ({
  children,
  ref,
  component,
  ...props
}) => {
  const purifiedHtml = useMemo(() => {
    return DOMPurify.sanitize(children);
  }, [children]);

  return children ? (
    <Typography
      component={component || 'div'}
      {...props}
      dangerouslySetInnerHTML={{ __html: purifiedHtml }}
    />
  ) : null;
};

export default CommonHtmlContent;
