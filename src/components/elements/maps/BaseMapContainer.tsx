import 'leaflet/dist/leaflet.css';

import { Box, SxProps } from '@mui/system';
import L from 'leaflet';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

import { MapContainer, MapContainerProps, TileLayer } from 'react-leaflet';

// Fix for default marker icon issue with Vite
L.Icon.Default.prototype.options.iconUrl = markerIconUrl;
L.Icon.Default.prototype.options.iconRetinaUrl = markerIconRetinaUrl;
L.Icon.Default.prototype.options.shadowUrl = markerShadowUrl;
L.Icon.Default.imagePath = '';

export interface BaseMapContainerProps extends MapContainerProps {
  children: React.ReactNode;
  height: string | number; // require container height
  sx?: SxProps;
}

const BaseMapContainer: React.FC<BaseMapContainerProps> = ({
  height,
  sx,
  children,
  ...props
}) => {
  return (
    <Box sx={{ height, ...sx }}>
      <MapContainer style={{ height: '100%' }} {...props}>
        <>
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {children}
        </>
      </MapContainer>
    </Box>
  );
};

export default BaseMapContainer;
