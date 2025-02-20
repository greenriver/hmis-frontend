import { CardProps, Paper, Typography } from '@mui/material';
import { ElementType, ReactNode } from 'react';

export interface CommonCardProps {
  children: ReactNode;
  title?: ReactNode;
  titleComponent?: ElementType<any>;
  sx?: CardProps['sx'];
  className?: string;
}

// TODO(#7191): Replace usages of CommonCard and TitleCard with CommonCollapsibleCard
export const commonCardPaperPadding = { py: 2, px: 2.5 };
export const commonCardTitleVariant = 'h5';

// extracted from ViewCard
export const CommonCard: React.FC<CommonCardProps> = ({
  title,
  titleComponent,
  children,
  className,
  sx,
}) => {
  const titleTypographyProps = titleComponent
    ? { component: titleComponent }
    : {};

  return (
    <Paper
      sx={{
        ...commonCardPaperPadding,
        pageBreakInside: 'avoid',
        ...sx,
      }}
      className={className}
    >
      {typeof title === 'string' ? (
        <Typography
          variant={commonCardTitleVariant}
          sx={{ mb: 2 }}
          {...titleTypographyProps}
        >
          {title}
        </Typography>
      ) : (
        title
      )}

      {children}
    </Paper>
  );
};
