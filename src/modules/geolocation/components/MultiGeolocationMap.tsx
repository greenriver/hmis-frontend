import L, { LatLngExpression } from 'leaflet';
import { useMemo } from 'react';
import { FeatureGroup, Marker, Popup } from 'react-leaflet';

import BaseMapContainer, {
  BaseMapContainerProps,
} from '@/modules/geolocation/components/BaseMapContainer';
import { GeolocationFieldsFragment } from '@/types/gqlTypes';

interface Props {
  geolocations: GeolocationFieldsFragment[];
  renderMarkerContent?: (
    geolocation: GeolocationFieldsFragment
  ) => React.ReactNode;
  BaseMapContainerProps?: Omit<BaseMapContainerProps, 'children'>;
}

function locationToLatLngExpression(location: GeolocationFieldsFragment) {
  if (
    !location.coordinates ||
    !location.coordinates.latitude ||
    !location.coordinates.longitude
  ) {
    return null;
  }
  return [
    parseFloat(location.coordinates?.latitude as string),
    parseFloat(location.coordinates?.longitude as string),
  ];
}
// Map that displays multiple Geolocations as markers
const MultiGeolocationMap: React.FC<Props> = ({
  geolocations,
  renderMarkerContent,
  BaseMapContainerProps,
}) => {
  // filter out any locations that are missing lat/lon
  const filteredLocations = useMemo(() => {
    return geolocations.filter(
      (location) => !!locationToLatLngExpression(location)
    );
  }, [geolocations]);

  // find bounds for the map
  const bounds = useMemo(() => {
    const latLngExpressions: LatLngExpression[] = filteredLocations.map(
      (loc) => locationToLatLngExpression(loc) as LatLngExpression
    );
    return L.latLngBounds(latLngExpressions);
  }, [filteredLocations]);

  return (
    <BaseMapContainer
      bounds={bounds}
      boundsOptions={{ padding: [20, 20] }}
      zoom={16}
      dragging
      scrollWheelZoom={false}
      doubleClickZoom
      touchZoom
      {...BaseMapContainerProps}
    >
      <FeatureGroup>
        {filteredLocations.map((location) => (
          <Marker
            key={location.id}
            position={locationToLatLngExpression(location) as LatLngExpression}
          >
            {renderMarkerContent && (
              <Popup>{renderMarkerContent(location)}</Popup>
            )}
          </Marker>
        ))}
      </FeatureGroup>
    </BaseMapContainer>
  );
};
export default MultiGeolocationMap;
