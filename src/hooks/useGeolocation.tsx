import { useCallback, useState } from 'react';

export function useGeolocation() {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestCoordinates = useCallback(() => {
    setError('');
    setCoordinates(null);
    const handleSuccess = (position) => {
      setCoordinates(position.coords);
      setLoading(false);
    };

    const handleError = (error: GeolocationPositionError) => {
      setLoading(false);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setError('User denied the request for Geolocation.');
          break;
        case error.POSITION_UNAVAILABLE:
          setError('Location information is unavailable.');
          break;
        case error.TIMEOUT:
          setError('The request to get user location timed out.');
          break;
        default:
          setError('An unknown error occurred.');
          break;
      }
    };

    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    } else {
      setError('Geolocation not supported.');
      setLoading(false);
    }
  }, []);

  return {
    coordinates,
    error,
    loading,
    requestCoordinates,
  };
}
