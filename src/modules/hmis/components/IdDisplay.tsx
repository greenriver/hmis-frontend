import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, IconButton, Typography, TypographyProps } from '@mui/material';

interface Props extends TypographyProps {
  value: string;
  prefix?: string;
  withoutEmphasis?: boolean;
  shortenUuid?: boolean;
  clickToCopy?: boolean;
}

const IdDisplay = ({
  value,
  prefix,
  withoutEmphasis,
  shortenUuid = false,
  clickToCopy = false,
  ...props
}: Props) => {
  let displayValue = value;
  if (
    shortenUuid &&
    value &&
    typeof value === 'string' &&
    value.length === 32
  ) {
    displayValue = `${value.slice(0, 6)}..`;
  }

  const centerAlignedSx = {
    display: 'inline-flex',
    alignItems: 'center',
  };

  return (
    <Typography
      variant='body2'
      color='text.disabled'
      {...props}
      sx={{ ...centerAlignedSx, gap: 0.8, ...props.sx }}
    >
      {prefix ? `${prefix} ` : ''} ID:{' '}
      <Box
        component='span'
        sx={{
          fontWeight: withoutEmphasis ? undefined : 600,
          wordBreak: 'break-all',
          gap: 0.2,
          ...centerAlignedSx,
        }}
      >
        {displayValue}
        {(clickToCopy || value !== displayValue) && (
          <IconButton
            aria-label='copy'
            onClick={() => navigator.clipboard.writeText(value)}
            sx={{ fontSize: 'inherit' }}
            size='small'
          >
            <ContentCopyIcon fontSize='inherit' />
          </IconButton>
        )}
      </Box>
    </Typography>
  );
};

export default IdDisplay;
