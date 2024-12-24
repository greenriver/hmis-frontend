import { Marker } from 'react-leaflet';
import BaseMapContainer from './BaseMapContainer';
import { LatLon } from '@/types/geolocationTypes';

interface BaseMapProps {
  coordinates: LatLon;
  height?: number;
}

// Map for showing 1 pin on a static map.
// Used for display coordinates in Geolocation Input Field.
const SingleGeolocationMap: React.FC<BaseMapProps> = ({
  coordinates,
  height = 230,
}) => {
  return (
    <BaseMapContainer
      height={height}
      center={[coordinates.latitude, coordinates.longitude]}
      dragging={false}
    >
      <Marker
        position={[coordinates.latitude, coordinates.longitude]}
        title='Client Location'
      />
    </BaseMapContainer>
  );
};

export default SingleGeolocationMap;
