import 'leaflet/dist/leaflet.css';

import { Box } from '@mui/system';
import L from 'leaflet';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { LatLon } from '@/types/geolocationTypes';

// Fix for default marker icon issue with Vite
L.Icon.Default.prototype.options.iconUrl = markerIconUrl;
L.Icon.Default.prototype.options.iconRetinaUrl = markerIconRetinaUrl;
L.Icon.Default.prototype.options.shadowUrl = markerShadowUrl;
L.Icon.Default.imagePath = '';

interface BaseMapProps {
  coordinates: LatLon;
  height?: number;
  // todo: expand for LocationMap
}

const BaseMap: React.FC<BaseMapProps> = ({ coordinates, height = 230 }) => {
  return (
    <Box sx={{ height }}>
      <MapContainer
        key={JSON.stringify(coordinates)}
        center={[coordinates.latitude, coordinates.longitude]}
        zoom={16}
        style={{ height }}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom
        touchZoom
      >
        <>
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* todo: add Popup children for location map */}
          <Marker
            position={[coordinates.latitude, coordinates.longitude]}
            title='Client Location'
          />
        </>
      </MapContainer>
    </Box>
  );
};

export default BaseMap;
