import { LoadingButton } from '@mui/lab';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';

import { useCallback, useState } from 'react';
import { ClickToCopyChip } from '@/components/elements/ClickToCopy';
import CommonDialog from '@/components/elements/CommonDialog';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import { ScanCardIcon } from '@/components/elements/SemanticIcons';
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
        setCode(data.createScanCardCode?.scanCardCode?.value);
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
          <DialogContent sx={{ mt: 2 }}>
            <Stack gap={2}>
              <CommonLabeledTextBlock title='Bar Code ID'>
                <ClickToCopyChip value={code} />
              </CommonLabeledTextBlock>
              <CommonLabeledTextBlock title='Client Name'>
                <ClickToCopyChip value={clientBriefName(client)} />
              </CommonLabeledTextBlock>
              {parseAndFormatDate(client.dob) && (
                <CommonLabeledTextBlock title='Date of Birth'>
                  <ClickToCopyChip
                    value={parseAndFormatDate(client.dob) || ''}
                  />
                </CommonLabeledTextBlock>
              )}
              {/* <Button
                variant='outlined'
                sx={{ width: 'fit-content' }}
                startIcon={<DownloadIcon />}
              >
                Download Client Photo
              </Button> */}
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
