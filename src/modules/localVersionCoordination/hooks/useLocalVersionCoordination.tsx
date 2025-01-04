import { useState, useEffect, useCallback, useRef } from 'react';

export type LocalVersionedRecordType = 'Client' | 'Enrollment' | 'Assessment';

const MESSAGE_TYPE = 'VERSION_UPDATE';
interface RecordVersionMessage {
  type: typeof MESSAGE_TYPE;
  payload: { version: number };
}

const useLocalVersionCoordination = (
  recordType: LocalVersionedRecordType,
  recordId: string,
  currentVersion: number
) => {
  const [latestVersion, setLatestVersion] = useState(currentVersion);

  // message event handler
  const handleMessage = useCallback(
    (event: MessageEvent<RecordVersionMessage>) => {
      // console.info(`recieved on ${channel.name}`, event.data)
      if (
        event.data.type === MESSAGE_TYPE &&
        event.data.payload.version > currentVersion
      ) {
        setLatestVersion(event.data.payload.version);
      }
    },
    [currentVersion]
  );

  // manage channel connection
  const channelRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    const channelName = `record-sync-${recordType}-${recordId}`;
    channelRef.current = new BroadcastChannel(channelName);
    channelRef.current.addEventListener('message', handleMessage);
    // console.info(`open channel ${recordType}:${recordId}`)

    return () => {
      const channel = channelRef.current;
      if (channel) {
        channel.removeEventListener('message', handleMessage);
        channel.close();
        channelRef.current = null;
      }
    };
  }, [recordType, recordId, handleMessage]);

  // broadcast our current version
  useEffect(() => {
    const channel = channelRef.current;
    if (!channel) {
      console.error('tried to send on closed channel');
      return;
    }

    const message: RecordVersionMessage = {
      type: MESSAGE_TYPE,
      payload: { version: currentVersion },
    };
    channel.postMessage(message);
  }, [currentVersion]);

  return latestVersion;
};

export default useLocalVersionCoordination;
