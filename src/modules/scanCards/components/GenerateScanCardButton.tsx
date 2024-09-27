import { LoadingButton } from '@mui/lab';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

import { useCallback, useMemo, useState } from 'react';
import { cache } from '@/app/apolloClient';
import { ClickToCopyButton } from '@/components/elements/ClickToCopy';
import CommonDialog from '@/components/elements/CommonDialog';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import {
  DownloadIcon,
  GenerateScanCardIcon,
} from '@/components/elements/SemanticIcons';
import {
  clientBriefName,
  dataUrlForClientImage,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import {
  ClientFieldsFragment,
  useCreateScanCardMutation,
  useGetClientImageQuery,
} from '@/types/gqlTypes';

/**
 * Button to generate a scan card code, and then show
 * the code + some client details in a modal.
 */
const GenerateScanCardButton: React.FC<{
  client: ClientFieldsFragment;
}> = ({ client }) => {
  const clientId = client.id;
  const [code, setCode] = useState<string | undefined>();
  const closeDialog = useCallback(() => {
    setCode(undefined);
  }, []);

  // Mutation for generating a new scan card code
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

  // Fetch client image for download button
  const { data: clientDataWithImage } = useGetClientImageQuery({
    variables: { id: clientId },
  });

  // Info for client image download
  const { href, filename } = useMemo(() => {
    const image = clientDataWithImage?.client?.image;
    if (!image) return {};

    return {
      href: dataUrlForClientImage(image),
      filename: `${code}_image.jpeg`,
    };
  }, [clientDataWithImage, code]);

  if (error) throw error;

  const clientName = clientBriefName(client);
  const clientDob = parseAndFormatDate(client.dob);

  return (
    <>
      <LoadingButton
        startIcon={<GenerateScanCardIcon />}
        variant='outlined'
        loading={loading}
        onClick={() => mutate()}
      >
        Generate Scan Card
      </LoadingButton>
      <CommonDialog open={!!code} maxWidth='xs' fullWidth onClose={closeDialog}>
        <DialogTitle>Scan Card Information</DialogTitle>
        {code && (
          <DialogContent sx={{ mt: 2 }}>
            <Typography sx={{ mb: 4 }}>
              Copy the scan card information by highlighting the text or using
              the copy buttons.
            </Typography>
            <Stack gap={2}>
              <CommonLabeledTextBlock title='Bar Code ID' variant='body1'>
                {code}
                <ClickToCopyButton value={code} aria-label='Copy Bar Code ID' />
              </CommonLabeledTextBlock>
              <CommonLabeledTextBlock title='Client Name' variant='body1'>
                {clientName}
                <ClickToCopyButton
                  value={clientName}
                  aria-label='Copy Client Name'
                />
              </CommonLabeledTextBlock>
              {clientDob && (
                <CommonLabeledTextBlock title='Date of Birth' variant='body1'>
                  {clientDob}
                  <ClickToCopyButton
                    value={clientDob}
                    aria-label='Copy Client DOB'
                  />
                </CommonLabeledTextBlock>
              )}
              {href && (
                <Button
                  variant='outlined'
                  sx={{ width: 'fit-content', my: 1 }}
                  startIcon={<DownloadIcon />}
                  href={href}
                  download={filename}
                >
                  Download Client Photo
                </Button>
              )}
            </Stack>
          </DialogContent>
        )}
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={closeDialog} variant='gray'>
            Close
          </Button>
        </DialogActions>
      </CommonDialog>
    </>
  );
};

export default GenerateScanCardButton;
