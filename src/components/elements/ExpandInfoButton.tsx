import ExpandIcon from '@mui/icons-material/ArrowDownward';
import CollapseIcon from '@mui/icons-material/ArrowUpward';
import { Button, ButtonProps } from '@mui/material';

interface Props extends ButtonProps {
  expanded: boolean;
}

const ExpandInfoButton: React.FC<Props> = ({ expanded, ...props }) => {
  return (
    <Button
      variant='text'
      aria-expanded={expanded}
      size='large'
      endIcon={
        expanded ? <CollapseIcon key='expand' /> : <ExpandIcon key='collapse' />
      }
      {...props}
      sx={({ typography }) => ({
        color: 'links',
        fontWeight: typography.fontWeightBold,
        width: 'fit-content',
        ml: -1,
      })}
    />
  );
};

export default ExpandInfoButton;
