import { Box, BoxProps, Skeleton } from '@mui/material';

import { useGetClientImageQuery } from '@/types/gqlTypes';

interface Props extends BoxProps<'img'> {
  clientId: string;
  showPlaceholder?: boolean;
  width?: number;
  height?: number;
}

/**
 * Renders a client's profile image. Returns null (displays nothing) if the client has no image.
 */
const ClientImage: React.FC<Props> = ({
  clientId,
  alt,
  showPlaceholder = false,
  width = 150,
  height = 150,
  ...props
}) => {
  const { data, loading: imageLoading = false } = useGetClientImageQuery({
    variables: { id: clientId },
  });
  const { base64, contentType = 'image/png' } = data?.client?.image || {};

  if (imageLoading && showPlaceholder) {
    return (
      <Skeleton
        variant='rectangular'
        sx={{
          height,
          width,
          minWidth: width,
          mr: 1,
        }}
      />
    );
  }
  if (!base64 && !showPlaceholder) return null;
  return (
    <Box
      component='img'
      alt={alt || 'Client image'}
      src={
        base64
          ? `data:${contentType};base64,${base64}`
          : `https://dummyimage.com/${width}x${height}/e8e8e8/aaa`
      }
      {...props}
      sx={{
        ...props.sx,
        height,
        width,
        mr: 1,
      }}
    />
  );
};

export default ClientImage;
