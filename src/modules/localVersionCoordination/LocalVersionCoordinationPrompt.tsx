import { LoadingButton } from '@mui/lab';
import { Box } from '@mui/system';
import { useCallback, useEffect, useState } from 'react';
import SnackbarAlert from '@/components/elements/SnackbarAlert';
import useLocalVersionCoordination, {
  LocalVersionedRecordType,
} from '@/modules/localVersionCoordination/hooks/useLocalVersionCoordination';
import { cache } from '@/providers/apolloClient';

interface Props {
  recordType: LocalVersionedRecordType;
  recordId: string;
  currentVersion: number;
  onReload?: VoidFunction;
}
const LocalVersionCoordinationPrompt: React.FC<Props> = ({
  recordType,
  recordId,
  currentVersion,
  onReload,
}) => {
  const [acknowledgedVersion, setAcknowledgedVersion] =
    useState(currentVersion);
  const [loading, setLoading] = useState(false);
  const latestVersion = useLocalVersionCoordination(
    recordType,
    recordId,
    currentVersion
  );

  const handleReload = useCallback(() => {
    setLoading(true);
    if (onReload) {
      onReload();
    } else {
      // default: on reload evict the cache
      cache.evict({ id: `${recordType}:${recordId}` });
    }
  }, [onReload, recordId, recordType]);

  useEffect(() => {
    if (currentVersion === latestVersion) {
      setLoading(false);
    }
  }, [currentVersion, latestVersion]);

  const handleContinue = () => {
    setAcknowledgedVersion(latestVersion);
  };

  // hide prompt if we are on the latest version OR we are on an old version but the user has acknowledged it
  const showPrompt =
    latestVersion > Math.max(acknowledgedVersion, currentVersion);

  return (
    <SnackbarAlert
      open={showPrompt}
      onClose={handleContinue}
      title='New Data available'
      alertProps={{ severity: 'warning' }}
    >
      <Box sx={{ my: 1 }}>
        The data on this page is out-of-date. You won't be able to save changes
        to this record until you load with new data.
      </Box>
      <Box sx={{ mt: 2 }}>
        <LoadingButton onClick={handleReload} loading={loading}>
          Reload with New Data
        </LoadingButton>
      </Box>
    </SnackbarAlert>
  );

  //return (
  //  <ConfirmationDialog
  //    title={`New ${recordType} data available`}
  //    cancelText='Continue anyway'
  //    confirmText='Load new data'
  //    onConfirm={handleReload}
  //    onCancel={handleContinue}
  //    loading={loading}
  //  >
  //    <div>
  //    </div>
  //  </ConfirmationDialog>
  //);
};

export default LocalVersionCoordinationPrompt;
