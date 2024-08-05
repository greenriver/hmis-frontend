import { Typography } from '@mui/material';
import React from 'react';
import { useGeolocation } from '../../../hooks/useGeolocation';
import LoadingButton from '../LoadingButton';

/**
 * WIP! Proof of concept component for getting coordinates from HTML5 geolocation API.
 * - Needs to be wired up with Props to be used as an Input component.
 * - Likely needs to use a mapping API to display the coordinates on a map.
 */
const GeolocationInput = () => {
  const { coordinates, requestCoordinates, loading, error } = useGeolocation();

  return (
    <>
      <LoadingButton onClick={requestCoordinates} loading={loading}>
        Request Location
      </LoadingButton>
      {error && <Typography color='error'>{error}</Typography>}
      <div>
        {/* {location && (
          <img
            alt='Map Holder'
            src={`https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude + ',' + location.longitude}&zoom=16&size=400x300&output=embed`}
          />
        )} */}
        {coordinates && (
          <Typography>
            Latitude: {coordinates.latitude}
            <br />
            Longitude: {coordinates.longitude}
          </Typography>
        )}
      </div>
    </>
  );
};

export default GeolocationInput;
