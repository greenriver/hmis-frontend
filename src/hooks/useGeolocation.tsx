import { useCallback, useState } from 'react';
import { LatLon } from '@/types/geolocationTypes';

export enum LocationPositionError {
  PERMISSION_DENIED = 'permission_denied',
  POSITION_UNAVAILABLE = 'position_unavailable',
  TIMEOUT = 'timeout',
  UNKNOWN_ERROR = 'unknown_error',
}

export function useGeolocation(
  setCoordinates: (coords: LatLon | null) => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationPositionError | undefined>();

  const requestCoordinates = useCallback(() => {
    setError(undefined);
    setCoordinates(null);
    const handleSuccess = (position: { coords: LatLon }) => {
      setCoordinates(position.coords);
      setLoading(false);
    };

    const handleError = (error: GeolocationPositionError) => {
      setLoading(false);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setError(LocationPositionError.PERMISSION_DENIED);
          break;
        case error.POSITION_UNAVAILABLE:
          setError(LocationPositionError.POSITION_UNAVAILABLE);
          break;
        case error.TIMEOUT:
          setError(LocationPositionError.TIMEOUT);
          break;
        default:
          setError(LocationPositionError.UNKNOWN_ERROR);
          break;
      }
    };

    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    } else {
      setError(LocationPositionError.POSITION_UNAVAILABLE);
      setLoading(false);
    }
  }, [setCoordinates]);

  return {
    requestCoordinates,
    error,
    loading,
  };
}
