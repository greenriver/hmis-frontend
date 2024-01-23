import { LoadingButton } from '@mui/lab';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';

import { useCallback, useState } from 'react';
import { ClickToCopyChip } from '@/components/elements/ClickToCopyId';
import CommonDialog from '@/components/elements/CommonDialog';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import {
  DownloadIcon,
  ScanCardIcon,
} from '@/components/elements/SemanticIcons';
import { clientBriefName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import {
  ClientFieldsFragment,
  useCreateScanCardMutation,
} from '@/types/gqlTypes';

const GenerateScanCardButton: React.FC<{
  client: ClientFieldsFragment;
}> = ({ client }) => {
  const clientId = client.id;
  const [code, setCode] = useState<string | undefined>();
  const closeDialog = useCallback(() => {
    setCode(undefined);
  }, []);

  const [mutate, { loading, error }] = useCreateScanCardMutation({
    variables: { clientId },
    onCompleted: (data) => {
      if (data.createScanCardCode?.scanCardCode) {
        cache.evict({
          id: `Client:${clientId}`,
          fieldName: 'scanCardCodes',
        });
        setCode(data.createScanCardCode?.scanCardCode?.code);
      }
    },
  });

  if (error) throw error;

  return (
    <>
      <LoadingButton
        startIcon={<ScanCardIcon />}
        variant='outlined'
        loading={loading}
        onClick={() => mutate()}
      >
        Generate Scan Card
      </LoadingButton>
      <CommonDialog open={!!code} fullWidth onClose={closeDialog}>
        <DialogTitle>Scan Card Information</DialogTitle>
        {code && (
          <DialogContent sx={{ my: 2 }}>
            {/* <Typography sx={{ mb: 2 }}>Click to copy values</Typography> */}
            <Stack gap={4}>
              <CommonLabeledTextBlock title='Bar Code ID' variant='body1'>
                <ClickToCopyChip
                  value={code}
                  sx={{ fontSize: (theme) => theme.typography.body1 }}
                />
              </CommonLabeledTextBlock>
              <CommonLabeledTextBlock title='Client Name' variant='body1'>
                <ClickToCopyChip
                  value={clientBriefName(client)}
                  sx={{ fontSize: (theme) => theme.typography.body1 }}
                />
              </CommonLabeledTextBlock>
              {parseAndFormatDate(client.dob) && (
                <CommonLabeledTextBlock title='Date of Birth' variant='body1'>
                  <ClickToCopyChip
                    value={parseAndFormatDate(client.dob) || ''}
                    sx={{ fontSize: (theme) => theme.typography.body1 }}
                  />
                </CommonLabeledTextBlock>
              )}
              <Button
                variant='outlined'
                sx={{ width: 'fit-content' }}
                startIcon={<DownloadIcon />}
              >
                Download Client Photo
              </Button>
            </Stack>
          </DialogContent>
        )}
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={closeDialog}>Close</Button>
        </DialogActions>
      </CommonDialog>
    </>
  );
};

export default GenerateScanCardButton;
