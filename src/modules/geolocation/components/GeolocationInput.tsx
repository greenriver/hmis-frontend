import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Stack,
  Typography,
} from '@mui/material';

import React, { useId, useRef } from 'react';

import { useGeolocation } from '../hooks/useGeolocation';
import { ClearIcon, MyLocationIcon } from '@/components/elements/SemanticIcons';
import { DynamicInputCommonProps } from '@/modules/form/types';
import GeolocationErrorAlert from '@/modules/geolocation/components/GeolocationErrorAlert';
import SingleGeolocationMap from '@/modules/geolocation/components/SingleGeolocationMap';
import { LatLon } from '@/modules/geolocation/types';

interface GeolocationInputProps
  extends Pick<DynamicInputCommonProps, 'label' | 'helperText' | 'disabled'> {
  value?: LatLon | null;
  onChange: (value: LatLon | null) => void;
}

const GeolocationInput: React.FC<GeolocationInputProps> = ({
  label,
  value: coordinates,
  onChange,
  helperText,
  disabled,
}) => {
  const { requestCoordinates, loading, error } = useGeolocation(onChange);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const labelId = useId();
  const mapHeight = 230;

  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        {label && <div id={labelId}>{label}</div>}
        {error && <GeolocationErrorAlert error={error} />}
        <Stack
          direction='row'
          sx={{ my: 0.5 }}
          columnGap={2}
          rowGap={1}
          flexWrap='wrap'
          alignItems='center'
        >
          <Button
            onClick={requestCoordinates}
            startIcon={<MyLocationIcon />}
            variant='outlined'
            aria-labelledby={label ? labelId : undefined}
            disabled={disabled}
            ref={buttonRef}
          >
            Request Location
          </Button>
          {coordinates && (
            <Button
              variant='gray' // TODO: update to outlined grayscale
              onClick={() => {
                onChange(null);
                buttonRef.current?.focus(); // move focus to Request Location button
              }}
              startIcon={<ClearIcon />}
            >
              Clear Map
            </Button>
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
              <SingleGeolocationMap
                coordinates={coordinates}
                height={mapHeight}
              />
            </Box>
          )}
        </Box>
      </FormControl>
    </>
  );
};

export default GeolocationInput;
