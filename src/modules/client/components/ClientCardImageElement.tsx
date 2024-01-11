import { Box, BoxProps, Typography } from '@mui/material';
import React from 'react';

import { ClientImageFragment } from '@/types/gqlTypes';

type Props = {
  client?: ClientImageFragment;
  base64?: string;
  url?: string;
  size?: number;
} & BoxProps<'img'>;

const ClientCardImageElement: React.FC<Props> = ({
  client,
  base64,
  url,
  size = 150,
  ...props
}) => {
  // let src = 'https://dummyimage.com/150x150/e8e8e8/aaa';
  let src;

  if (client?.image?.base64)
    src = `data:image/jpeg;base64,${client.image.base64}`;
  if (base64) src = `data:image/jpeg;base64,${base64}`;
  if (url) src = url;

  return (
    <Box
      alt='client'
      src={src}
      {...props}
      sx={{
        height: size,
        width: size,
        backgroundColor: (theme) => theme.palette.grey[100],
        borderRadius: (theme) => `${theme.shape.borderRadius}px`,
        ...props.sx,
      }}
      component={src ? 'img' : undefined}
    >
      {src ? undefined : (
        <Typography
          sx={{
            color: (theme) => theme.palette.text.disabled,
            borderBottom: 0,
            display: 'flex',
            flexGrow: 1,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          variant='body2'
          component='span'
        >
          No Client Photo
        </Typography>
      )}
    </Box>
  );
};

export default ClientCardImageElement;
