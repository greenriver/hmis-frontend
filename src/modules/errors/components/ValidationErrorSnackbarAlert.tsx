import { useCallback, useState } from 'react';
import SnackbarAlert from '@/components/elements/SnackbarAlert';
import ValidationErrorList from '@/modules/errors/components/ValidationErrorList';
import { UNKNOWN_VALIDATION_ERROR_HEADING } from '@/modules/errors/util';
import { ValidationError } from '@/types/gqlTypes';

interface Props {
  errors: ValidationError[];
}

/**
 * Snackbar alert component for displaying validation errors.
 *
 * NOTE: for form submission, the preferred way to display
 * ValidationErrors is within the form, and then warnings
 * displayed in a Confirmable Dialog. (NOT ValidationErrorSnackbarAlert)
 *
 * This "Snackbar" approach for displaying ValidationErrors was
 * introduced for the BulkAssignService workflow, where we don't
 * have an existing pattern for displaying errors and warnings.
 * (It could use further implrovement by displaying Warnings in a
 * _confirmable_, and Errors with some more explanatory text and clearer
 * information about which client the message pertains too. (For example
 * explaining that a client would have an overlapping enrollment because
 * they have an entry date on X, which is a common error with the Bed Night workflow)
 */
const ValidationErrorSnackbarAlert: React.FC<Props> = ({ errors }) => {
  const [open, setOpen] = useState(true);
  const closeSnackbar = useCallback(() => setOpen(false), []);

  return (
    <SnackbarAlert
      title={UNKNOWN_VALIDATION_ERROR_HEADING}
      open={open}
      onClose={closeSnackbar}
      alertProps={{ severity: 'error' }}
    >
      <ValidationErrorList errors={errors} />
    </SnackbarAlert>
  );
};

export default ValidationErrorSnackbarAlert;
