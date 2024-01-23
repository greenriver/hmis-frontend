import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  Chip,
  ChipProps,
  IconButton,
  Typography,
  TypographyProps,
} from '@mui/material';

interface Props {
  value: string;
  sx?: TypographyProps['sx'];
  variant?: TypographyProps['variant'];
  trimLengthAbove?: number | null;
}

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
          <ContentCopyIcon fontSize='inherit' />
        </IconButton>
      )}
    </Typography>
  );
};

export const ClickToCopy: React.FC<Props> = ({ value, variant, sx }) => {
  return (
    <Typography sx={sx} variant={variant} component='div'>
      {value}
      <IconButton
        aria-label='copy'
        onClick={() => navigator.clipboard.writeText(value)}
        sx={{ fontSize: 'inherit' }}
        size='small'
      >
        <ContentCopyIcon fontSize='inherit' />
      </IconButton>
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
      icon={<ContentCopyIcon fontSize='inherit' />}
      label={value}
      {...props}
      sx={{ width: 'fit-content', px: 2, ...sx }}
    />
  );
};
