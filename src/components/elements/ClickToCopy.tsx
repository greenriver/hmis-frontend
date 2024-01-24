import {
  Chip,
  ChipProps,
  IconButton,
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

export const ClickToCopyChip: React.FC<{ value: string } & ChipProps> = ({
  value,
  sx,
  ...props
}) => {
  return (
    <Chip
      variant='outlined'
      onClick={() => navigator.clipboard.writeText(value)}
      icon={<CopyIcon fontSize='inherit' />}
      label={value}
      {...props}
      sx={{ width: 'fit-content', px: 2, ...sx }}
    />
  );
};
