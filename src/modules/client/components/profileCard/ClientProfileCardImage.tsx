import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Box, Chip, Link, SxProps } from '@mui/material';
import { useCallback, useRef, useState } from 'react';

import ClientCardImageElement from '../ClientCardImageElement';
import ClientImageUploadDialog from '@/modules/client/components/profileCard/ClientImageUploadDialog';
import { getClientImageAltText } from '@/modules/hmis/hmisUtil';
import { ClientImageFragment } from '@/types/gqlTypes';

interface Props {
  client?: ClientImageFragment;
  clientName?: string;
  size?: number;
}

const ClientProfileCardImage: React.FC<Props> = ({
  client,
  clientName,
  size = 150,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const linkRef = useRef<HTMLButtonElement | null>(null);

  const handleClose = useCallback(() => {
    setOpen(false);
    // Without this the overlay will continue to show after the modal is closed
    setTimeout(() => linkRef.current?.blur());
  }, []);
  const handleOpen = useCallback(() => setOpen(true), []);

  if (!client) return <ClientCardImageElement />;

  if (!client.access.canViewClientPhoto) return;

  const overlaySx: SxProps = {
    opacity: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    inset: 0,
    transition: 'opacity 0.2s',
    pointerEvents: 'none',
  };

  const clientImageAltText = getClientImageAltText(clientName);

  return (
    <>
      <ClientImageUploadDialog
        open={open}
        onClose={handleClose}
        clientId={client.id}
        baseImageAltText={clientImageAltText}
      />
      {client.access.canEditClient ? (
        <Link
          component='button'
          underline='none'
          onClick={handleOpen}
          ref={linkRef}
          sx={{
            position: 'relative',
            width: size,
            height: size,
            '&:focus-within > .overlay': {
              opacity: 1,
            },
            '&:hover > .overlay': {
              opacity: 1,
            },
          }}
        >
          <ClientCardImageElement
            size={size}
            client={client}
            alt={clientImageAltText}
          />
          {client.image?.base64 ? (
            // Has photo
            <Box
              className='overlay'
              sx={{
                ...overlaySx,
                backgroundColor: 'rgba(0,0,0, 0.5)',
              }}
            >
              <Chip
                label='Update Photo'
                icon={<EditIcon />}
                sx={{
                  backgroundColor: (theme) => theme.palette.grey[200],
                }}
              />
            </Box>
          ) : (
            // No photo
            <Box
              className='overlay'
              sx={{
                ...overlaySx,
                backgroundColor: (theme) => theme.palette.grey[100],
              }}
            >
              <Chip label='Add Client Photo' icon={<PhotoCameraIcon />} />
            </Box>
          )}
        </Link>
      ) : (
        <ClientCardImageElement
          size={size}
          client={client}
          alt={clientImageAltText}
        />
      )}
    </>
  );
};

export default ClientProfileCardImage;
