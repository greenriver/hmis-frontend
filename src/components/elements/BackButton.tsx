import { Button, ButtonProps } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BackIcon } from './SemanticIcons';

const BackButton: React.FC<ButtonProps> = (props) => {
  const navigate = useNavigate();
  return (
    <Button
      startIcon={<BackIcon />}
      variant='gray'
      size='small'
      onClick={() => navigate(-1)}
      {...props}
      sx={{ width: 'fit-content', ...props.sx }}
    />
  );
};

export default BackButton;
