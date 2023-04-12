import { useEffect, useMemo, useState } from 'react';

import { ErrorState } from '@/modules/errors/util';
import FormWarningDialog, {
  FormWarningDialogProps,
} from '@/modules/form/components/FormWarningDialog';

interface Args {
  errorState: ErrorState;
  onConfirm: FormWarningDialogProps['onConfirm'];
  loading?: boolean;
}
export function useWarningDialog({ errorState, onConfirm, loading }: Args) {
  const [showDialog, setShowDialog] = useState<boolean>(false);

  useEffect(() => {
    // Show dialog if there are warnings but no errors
    setShowDialog(
      errorState.warnings.length > 0 && errorState.errors.length === 0
    );
  }, [errorState]);

  const WarningDialog = useMemo(() => {
    const DialogComponent: React.FC<
      Omit<
        FormWarningDialogProps,
        'open' | 'onCancel' | 'onConfirm' | 'loading' | 'warnings'
      >
    > = (props) => (
      <FormWarningDialog
        open={showDialog}
        onConfirm={onConfirm}
        onCancel={() => setShowDialog(false)}
        warnings={errorState.warnings}
        loading={loading || false}
        {...props}
      />
    );
    return DialogComponent;
  }, [onConfirm, errorState, showDialog, loading]);

  return {
    WarningDialog,
  };
}
