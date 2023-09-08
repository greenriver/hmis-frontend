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
      size='large'
      sx={{ fontWeight: '800' }}
      endIcon={
        expanded ? <CollapseIcon key='expand' /> : <ExpandIcon key='collapse' />
      }
      {...props}
    />
  );
};

export default ExpandInfoButton;
