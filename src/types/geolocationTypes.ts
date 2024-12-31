import { parseJson } from '@/utils/jsonUtil';

export type LatLon = Pick<GeolocationCoordinates, 'latitude' | 'longitude'>;

export function isLatLon(value: unknown): value is LatLon {
  return (
    typeof value === 'object' &&
    value !== null &&
    'latitude' in value &&
    'longitude' in value &&
    typeof value.latitude === 'number' &&
    typeof value.longitude === 'number'
  );
}

export function safeParseLatLon(value: any): LatLon | undefined {
  // Already in LatLon shape
  if (isLatLon(value)) return value;

  // Try to parse to LatLon shape from string.
  // Coordinates may be stringified if collected from an External Form.
  const parsed = parseJson<LatLon>(value);
  // Use type guard again, to ensure that latitude and longitude are present
  if (isLatLon(parsed)) return parsed;

  return undefined;
}
