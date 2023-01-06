import { Box, Skeleton } from '@mui/material';

import { useGetClientImageQuery } from '@/types/gqlTypes';

interface Props {
  clientId: string;
  showPlaceholder?: boolean;
  width?: number;
  height?: number;
}
const ClientImage: React.FC<Props> = ({
  clientId,
  showPlaceholder = false,
  width = 150,
  height = 150,
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
      alt='client'
      src={
        base64
          ? `data:${contentType};base64,${base64}`
          : `https://dummyimage.com/${width}x${height}/e8e8e8/aaa`
      }
      sx={{
        height,
        width,
        mr: 1,
      }}
    />
  );
};

export default ClientImage;
