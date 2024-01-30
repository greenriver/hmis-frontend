import {
  IconButton,
  IconButtonProps,
  Typography,
  TypographyProps,
} from '@mui/material';
import { CopyIcon } from './SemanticIcons';

interface Props {
  value: string;
  sx?: TypographyProps['sx'];
  variant?: TypographyProps['variant'];
  trimLengthAbove?: number | null;
}

// For displaying trimmed UUIDs
export const ClickToCopyId: React.FC<Props> = ({
  value,
  variant = 'body2',
  sx,
}) => {
  let displayValue = value;
  if (value && typeof value === 'string' && value.length > 16) {
    displayValue = `${value.slice(0, 6)}..`;
  }
  return (
    <Typography sx={sx} variant={variant} component='div'>
      {displayValue}
      {value !== displayValue && (
        <IconButton
          aria-label='copy'
          onClick={() => navigator.clipboard.writeText(value)}
          sx={{ fontSize: 'inherit' }}
          size='small'
        >
          <CopyIcon fontSize='inherit' />
        </IconButton>
      )}
    </Typography>
  );
};

export const ClickToCopyButton: React.FC<
  { value: string } & IconButtonProps
> = ({ value, ...props }) => {
  return (
    <IconButton
      aria-label='copy'
      onClick={() => navigator.clipboard.writeText(value)}
      sx={{ fontSize: 'inherit', color: 'links' }}
      {...props}
    >
      <CopyIcon fontSize='inherit' />
    </IconButton>
  );
};
