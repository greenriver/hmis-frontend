import { Draw } from '@mui/icons-material';
import { Paper, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { GroupItemComponentProps } from '@/modules/form/types';

const SignatureEnvelope = ({
  renderChildItem,
  item,
}: GroupItemComponentProps) => {
  return (
    <Paper sx={{ m: 2, p: 3 }}>
      <Stack spacing={2}>
        <Typography variant='h3' color='primary' fontWeight={600}>
          <Draw sx={{ mr: 1 }} />
          eSignature
        </Typography>
        <Typography variant='body1'>
          The following signatures are required on this document.
        </Typography>
        {renderChildItem &&
          item.item?.map((childItem) => renderChildItem(childItem))}
      </Stack>
    </Paper>
  );
};

export default SignatureEnvelope;
