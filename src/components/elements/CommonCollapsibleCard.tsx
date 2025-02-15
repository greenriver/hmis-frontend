import {
  Collapse,
  CollapseProps,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ReactNode } from 'react';
import {
  commonCardPaperPadding,
  commonCardTitleVariant,
} from '@/components/elements/CommonCard';
import {
  ExpandLessIcon,
  ExpandMoreIcon,
} from '@/components/elements/SemanticIcons';

interface CommonCollapsibleCardProps {
  title: string;
  children: ReactNode;
  open?: boolean;
  onClick?: CollapseProps['onClick'];
  onExited?: CollapseProps['onExited'];
}

const CommonCollapsibleCard: React.FC<CommonCollapsibleCardProps> = ({
  open,
  title,
  children,
  onClick,
  onExited,
}) => {
  const collapsibleTitle = (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        '&:hover': { backgroundColor: '#F1F2F9' }, // FIXME: primary surface when theme is merged
        ...commonCardPaperPadding, // make sure this matches CommonCard
        pageBreakInside: 'avoid',
      }}
    >
      <Typography variant={commonCardTitleVariant}>{title}</Typography>
      {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
    </Stack>
  );

  return (
    <Paper>
      {collapsibleTitle}
      <Collapse in={open} timeout='auto' unmountOnExit onExited={onExited}>
        {children}
      </Collapse>
    </Paper>
  );
};

export default CommonCollapsibleCard;
