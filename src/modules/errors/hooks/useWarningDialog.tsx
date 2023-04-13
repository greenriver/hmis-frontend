import { useEffect, useMemo, useState } from 'react';

import { WarningDialogProps } from '@/modules/errors/components/WarningDialog';
import { ErrorState, hasOnlyWarnings } from '@/modules/errors/util';

interface Args {
  errorState: ErrorState;
  onConfirm: WarningDialogProps['onConfirm'];
  loading?: boolean;
}

/**
 * Hook for using the WarningDialog component
 */
export function useWarningDialog({ errorState, onConfirm, loading }: Args) {
  const [showDialog, setShowDialog] = useState<boolean>(false);

  useEffect(() => {
    // Show dialog if there are warnings but no errors
    setShowDialog(!!(errorState && hasOnlyWarnings(errorState)));
  }, [errorState]);

  const warningDialogProps: WarningDialogProps = useMemo(
    () => ({
      open: true,
      onConfirm,
      onCancel: () => setShowDialog(false),
      warnings: errorState.warnings,
      loading: loading || false,
    }),
    [onConfirm, errorState, loading]
  );

  return {
    warningDialogProps,
    showWarningDialog: showDialog,
  };
}
