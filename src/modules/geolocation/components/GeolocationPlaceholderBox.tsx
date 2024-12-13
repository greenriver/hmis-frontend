import { Box, BoxProps } from '@mui/system';

interface Props extends BoxProps {
  children: React.ReactNode;
  height?: number;
}
const GeolocationPlaceholderBox: React.FC<Props> = ({
  height,
  children,
  sx,
  ...props
}) => {
  return (
    <Box
      {...props}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'background.default',
        borderColor: 'borders.dark',
        borderRadius: 1,
        borderWidth: 1,
        borderStyle: 'solid',
        height,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};
export default GeolocationPlaceholderBox;
