import { Button } from '@mui/material';
import { ReactNode } from 'react';

type SkipToContentProps = {
  focusTargetId: string;
  children?: ReactNode;
};

const SkipToContent: React.FC<SkipToContentProps> = ({
  focusTargetId,
  children,
}) => {
  const handleClick = () => {
    const container = document.getElementById(focusTargetId);
    if (container) {
      // First ensure the container is focusable
      if (!container.hasAttribute('tabindex')) {
        container.setAttribute('tabindex', '-1');
      }
      container.focus();
    }
  };

  return (
    <Button
      variant='contained'
      onClick={handleClick}
      sx={{
        // Use `clip` to hide the button when it isn't focused, without preventing focus entirely (which display:none and visibility:hidden would do)
        // `clip` is considered deprecated, but more widely supported than the more modern `clipPath`
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',

        // Remove padding, border, and margin
        padding: 0,
        margin: 0,
        border: 'none',
        position: 'absolute', // Ensure it doesn't take up any space

        '&:focus': {
          // On focus, restore clip and other styles so the button is visible and styled normally
          clip: 'auto',
          clipPath: 'none',
          position: 'relative',
          padding: '8px 16px',
          border: '1px solid',
        },
      }}
    >
      {children || 'Skip to Content'}
    </Button>
  );
};

export default SkipToContent;
