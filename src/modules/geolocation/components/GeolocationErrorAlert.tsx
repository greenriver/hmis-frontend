import { Alert, Button } from '@mui/material';

import { useState } from 'react';

import { LocationPositionError } from '../hooks/useGeolocation';
import GeolocationHelpDialog from '@/modules/geolocation/components/GeolocationHelpDialog';

interface Props {
  error: LocationPositionError;
}

const GeolocationErrorAlert: React.FC<Props> = ({ error }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <Alert
        severity='error'
        sx={{ my: 0.5 }}
        icon={false}
        action={
          error === LocationPositionError.PERMISSION_DENIED && (
            <Button
              variant='outlined'
              color='error'
              sx={{ backgroundColor: 'transparent' }}
              // TODO replace with:
              // variant='outlined'
              // color='grayscale'
              onClick={() => setShowHelp(true)}
            >
              Learn More
            </Button>
          )
        }
      >
        There is no location support on this device, or it is disabled. Please
        check your settings, then try again.
      </Alert>

      <GeolocationHelpDialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </>
  );
};

export default GeolocationErrorAlert;
