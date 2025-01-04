import { LoadingButton } from '@mui/lab';
import { ButtonProps } from '@mui/material';
import React, { useCallback, useRef } from 'react';

import { useGetClientLazyQuery } from '@/types/gqlTypes';

interface Props extends Omit<ButtonProps, 'onClick'> {
  clientId: string;
  children: string;
  onClick: VoidFunction | undefined;
}

// before on-click, refetch the client to ensure we have the latest values
const ClientForceRefetchButton: React.FC<Props> = ({
  clientId,
  children,
  onClick,
  ...buttonProps
}) => {
  const activeRequestClientId = useRef<string | null>(null);

  const [getClient, { loading, error }] = useGetClientLazyQuery({
    fetchPolicy: 'network-only',
  });
  if (error) throw error;

  const handleClick = useCallback(() => {
    activeRequestClientId.current = clientId;
    getClient({ variables: { id: clientId } }).then(() => {
      // Only trigger onClick if the clientId hasn't changed
      if (onClick && activeRequestClientId.current === clientId) {
        onClick?.();
      }
    });
  }, [clientId, getClient, onClick]);

  return (
    <LoadingButton loading={loading} onClick={handleClick} {...buttonProps}>
      {children}
    </LoadingButton>
  );
};

export default ClientForceRefetchButton;
