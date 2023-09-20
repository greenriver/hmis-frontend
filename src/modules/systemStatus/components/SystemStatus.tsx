import { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { useParams } from 'react-router-dom';
import { fetchSystemStatus } from '../api';

const SystemStatus = () => {
  const [status, setStatus] = useState<string | null>(null);
  const { detailType } = useParams();

  useEffect(() => {
    if (!detailType) return;

    fetchSystemStatus(detailType).then(setStatus);
  }, [detailType]);
  return status;
};

export default SystemStatus;
