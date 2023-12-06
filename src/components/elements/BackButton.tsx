import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { forwardRef } from 'react';
import ButtonLink, { ButtonLinkProps } from './ButtonLink';

const BackButton = forwardRef<ButtonLinkProps, any>(({ ...props }, ref) => (
  <ButtonLink
    startIcon={<ArrowBackIcon />}
    variant='gray'
    size='small'
    {...props}
    sx={{ width: 'fit-content', ...props.sx }}
    ref={ref}
  />
));

BackButton.displayName = 'BackButton';

export default BackButton;
