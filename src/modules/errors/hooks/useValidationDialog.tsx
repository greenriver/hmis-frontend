import { useEffect, useState } from 'react';

import ValidationDialog, {
  ValidationDialogProps,
} from '@/modules/errors/components/ValidationDialog';
import {
  ErrorState,
  hasAnyValue,
  hasOnlyWarnings,
} from '@/modules/errors/util';

interface Args {
  errorState: ErrorState;
  includeErrors?: boolean;
}

/**
 * Hook for using the ValidationDialog component
 */
export function useValidationDialog({
  errorState,
  includeErrors = false,
}: Args) {
  const [showDialog, setShowDialog] = useState<boolean>(false);

  useEffect(() => {
    if (includeErrors) {
      setShowDialog(hasAnyValue(errorState));
    } else {
      // Show dialog if there are warnings but no errors
      setShowDialog(!!(errorState && hasOnlyWarnings(errorState)));
    }
  }, [includeErrors, errorState]);

  const renderValidationDialog = (
    props: Omit<ValidationDialogProps, 'open' | 'errorState' | 'onCancel'> &
      Partial<Pick<ValidationDialogProps, 'onCancel'>>
  ) => (
    <>
      {showDialog && (
        <ValidationDialog
          {...props}
          open
          onCancel={() => {
            setShowDialog(false);
            if (props.onCancel) props.onCancel();
          }}
          errorState={errorState}
        />
      )}
    </>
  );
  return { renderValidationDialog, validationDialogVisible: showDialog };
}
