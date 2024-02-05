import { Typography, TypographyProps } from '@mui/material';

interface Props extends TypographyProps {
  children: string;
}
const CommonHtmlContent: React.FC<Props> = ({ children, ref, ...props }) => {
  return children ? (
    <Typography
      {...props}
      component='div'
      dangerouslySetInnerHTML={{ __html: children }}
    />
  ) : null;
};

export default CommonHtmlContent;
