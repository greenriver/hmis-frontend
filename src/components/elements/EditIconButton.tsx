import { IconButton, IconButtonProps } from '@mui/material';
import ButtonTooltipContainer from './ButtonTooltipContainer';
import { EditIcon } from './SemanticIcons';

export interface EditIconButtonProps extends IconButtonProps {}

const EditIconButton: React.FC<EditIconButtonProps> = ({ ...props }) => {
  return (
    <ButtonTooltipContainer title={props.title}>
      <IconButton size='small' aria-label={props.title} {...props}>
        <EditIcon fontSize='inherit' />
      </IconButton>
    </ButtonTooltipContainer>
  );
};

export default EditIconButton;
