import { useCallback, useEffect, useState } from 'react';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
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
    <ConfirmationDialog
      open={showPrompt}
      title={`New ${recordType} data available`}
      cancelText='Continue anyway'
      confirmText='Load new data'
      onConfirm={handleReload}
      onCancel={handleContinue}
      loading={loading}
    >
      <div>
        It looks like you have another tab open with newer data for this record.
        Would you like to load the new data or
      </div>
    </ConfirmationDialog>
  );
};

export default LocalVersionCoordinationPrompt;
