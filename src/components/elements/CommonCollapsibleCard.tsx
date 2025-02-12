import { Collapse, Paper, Stack, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';
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
}

const CommonCollapsibleCard: React.FC<CommonCollapsibleCardProps> = ({
  open: initialOpen = true,
  title,
  children,
}) => {
  const [open, setOpen] = useState(initialOpen);

  const handleExpandClick = () => {
    setOpen(!open);
  };

  const collapsibleTitle = (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      onClick={handleExpandClick}
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
      <Collapse in={open} timeout='auto' unmountOnExit>
        {children}
      </Collapse>
    </Paper>
  );
};

export default CommonCollapsibleCard;
