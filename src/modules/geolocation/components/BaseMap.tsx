import { Marker } from 'react-leaflet';
import BaseMapContainer from '@/modules/geolocation/components/BaseMapContainer';
import { LatLon } from '@/modules/geolocation/types';

interface BaseMapProps {
  coordinates: LatLon;
  height?: number;
}

// Map for showing 1 pin on a static map.
// Used for display coordinates in Geolocation Input Field.
const BaseMap: React.FC<BaseMapProps> = ({ coordinates, height = 230 }) => {
  return (
    <BaseMapContainer
      key={JSON.stringify(coordinates)}
      height={height}
      center={[coordinates.latitude, coordinates.longitude]}
      zoom={16}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom
      touchZoom
    >
      <Marker position={[coordinates.latitude, coordinates.longitude]} />
    </BaseMapContainer>
  );
};

export default BaseMap;
