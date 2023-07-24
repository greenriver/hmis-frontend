import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton, Typography, TypographyProps } from '@mui/material';

interface Props {
  value: string;
  sx?: TypographyProps['sx'];
  variant?: TypographyProps['variant'];
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
