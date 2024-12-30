export type LatLon = Pick<GeolocationCoordinates, 'latitude' | 'longitude'>;

export function isLatLon(value: unknown): value is LatLon {
  return (
    typeof value === 'object' &&
    value !== null &&
    'latitude' in value &&
    'longitude' in value
  );
}
