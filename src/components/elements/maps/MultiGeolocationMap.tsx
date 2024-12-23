import L, { LatLngExpression } from 'leaflet';
import { useMemo } from 'react';
import { FeatureGroup, Marker, Popup } from 'react-leaflet';

import BaseMapContainer, { BaseMapContainerProps } from './BaseMapContainer';
import { GeolocationFieldsWithMetadataFragment } from '@/types/gqlTypes';

interface Props {
  geolocations: GeolocationFieldsWithMetadataFragment[];
  renderMarkerContent?: (
    geolocation: GeolocationFieldsWithMetadataFragment
  ) => React.ReactNode;
  height: string | number;
  BaseMapContainerProps?: Omit<BaseMapContainerProps, 'children' | 'height'>;
}

const locationToLatLngExpression = (
  location: GeolocationFieldsWithMetadataFragment
): LatLngExpression => {
  return [
    parseFloat(location.coordinates.latitude),
    parseFloat(location.coordinates.longitude),
  ] as LatLngExpression;
};

// Map that displays multiple Geolocations as markers
const MultiGeolocationMap: React.FC<Props> = ({
  geolocations,
  renderMarkerContent,
  height,
  BaseMapContainerProps,
}) => {
  // find bounds for the map
  const bounds = useMemo(() => {
    const latLngExpressions: LatLngExpression[] = geolocations.map((loc) =>
      locationToLatLngExpression(loc)
    );
    return L.latLngBounds(latLngExpressions);
  }, [geolocations]);

  return (
    <BaseMapContainer
      bounds={bounds}
      boundsOptions={{ padding: [20, 20] }}
      zoom={16}
      dragging
      scrollWheelZoom={false}
      doubleClickZoom
      touchZoom
      height={height}
      {...BaseMapContainerProps}
    >
      <FeatureGroup>
        {geolocations.map((location) => (
          <Marker
            key={location.id}
            position={locationToLatLngExpression(location)}
          >
            {renderMarkerContent && (
              <Popup minWidth={200} maxWidth={300}>
                {renderMarkerContent(location)}
              </Popup>
            )}
          </Marker>
        ))}
      </FeatureGroup>
    </BaseMapContainer>
  );
};
export default MultiGeolocationMap;
