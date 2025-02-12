import { forwardRef } from 'react';
import ButtonLink, { ButtonLinkProps } from './ButtonLink';
import { BackIcon } from './SemanticIcons';

const BackButtonLink = forwardRef<ButtonLinkProps, any>(({ ...props }, ref) => (
  <ButtonLink
    startIcon={<BackIcon />}
    variant='contained'
    color='grayscale'
    size='small'
    {...props}
    sx={{ width: 'fit-content', ...props.sx }}
    ref={ref}
  />
));

BackButtonLink.displayName = 'BackButtonLink';

export default BackButtonLink;
