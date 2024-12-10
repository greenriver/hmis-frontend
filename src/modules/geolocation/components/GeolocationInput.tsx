import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Link,
  Stack,
  Typography,
} from '@mui/material';

import React, { useId } from 'react';

import { LocationPositionError, useGeolocation } from '../hooks/useGeolocation';
import { ClearIcon, MyLocationIcon } from '@/components/elements/SemanticIcons';
import { DynamicInputCommonProps } from '@/modules/form/types';
import BaseMap from '@/modules/geolocation/components/BaseMap';
import GeolocationHelpDialog from '@/modules/geolocation/components/GeolocationHelpDialog';
import { LatLon } from '@/modules/geolocation/types';

interface GeolocationInputProps
  extends Pick<DynamicInputCommonProps, 'label' | 'helperText' | 'disabled'> {
  value?: LatLon | null;
  onChange: (value: LatLon | null) => void;
}

function getErrorMessage(error: LocationPositionError) {
  if (error === LocationPositionError.PERMISSION_DENIED) {
    return 'Get location not allowed';
  } else if (error === LocationPositionError.POSITION_UNAVAILABLE) {
    return 'Failed to find location';
  } else if (error === LocationPositionError.TIMEOUT) {
    return 'Failed to find location';
  } else if (error === LocationPositionError.UNKNOWN_ERROR) {
    return 'Failed to find location';
  }
}

const GeolocationInput: React.FC<GeolocationInputProps> = ({
  label,
  value: coordinates,
  onChange,
  helperText,
  disabled,
}) => {
  const { requestCoordinates, loading, error } = useGeolocation(onChange);
  const [showHelp, setShowHelp] = React.useState(false);
  const mapHeight = 230;
  const labelId = useId();
  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        {label && <div id={labelId}>{label}</div>}
        <Stack direction='row' sx={{ my: 0.5 }} gap={2} alignItems='center'>
          <Button
            onClick={requestCoordinates}
            startIcon={<MyLocationIcon />}
            variant='outlined'
            aria-labelledby={label ? labelId : undefined}
            disabled={disabled}
          >
            Request Location
          </Button>
          {coordinates && (
            <Button
              variant='gray' // TODO: update to outlined grayscale
              onClick={() => onChange(null)}
              startIcon={<ClearIcon />}
            >
              Clear Map
            </Button>
          )}
          {error && (
            <>
              <Typography color='error' variant='body2'>
                {getErrorMessage(error)}
              </Typography>
              {error === LocationPositionError.PERMISSION_DENIED && (
                <Link
                  component='button'
                  variant='body2'
                  onClick={() => setShowHelp(true)}
                >
                  How do I fix this?
                </Link>
              )}
            </>
          )}
        </Stack>

        {helperText && <FormHelperText>{helperText}</FormHelperText>}
        <Box sx={{ mt: 1 }}>
          {!coordinates && !disabled && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'background.default',
                borderColor: 'borders.dark',
                borderRadius: 1,
                borderWidth: 1,
                borderStyle: 'solid',
                height: mapHeight,
              }}
              aria-live='polite' // Notify screen readers of content updates
            >
              {loading ? (
                <Typography color='links' fontWeight={700}>
                  Getting Location ...
                </Typography>
              ) : (
                <Typography color='text.secondary'>
                  Location not collected
                </Typography>
              )}
            </Box>
          )}
          {coordinates && (
            <Box
              aria-live='polite' // Announce when the map is displayed
              aria-label="Map displaying the user's current location"
              role='complementary' // aria-label on a div should have a role
            >
              <BaseMap coordinates={coordinates} height={mapHeight} />
            </Box>
          )}
        </Box>
      </FormControl>
      <GeolocationHelpDialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </>
  );
};

export default GeolocationInput;
