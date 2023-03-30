import { Alert, AlertTitle } from '@mui/material';
import { reject } from 'lodash-es';

import ValidationErrorDisplay from './ValidationErrorDisplay';

import { ValidationError } from '@/types/gqlTypes';

const FIXABLE_ERROR_HEADING = 'Please fix outstanding errors';
const UNKNOWN_ERROR_HEADING = 'An error occurred';

const ErrorAlert = ({
  errors,
  fixable = true,
}: {
  errors: ValidationError[];
  fixable?: boolean;
}) => {
  const filtered = reject(errors, ['severity', 'warning']);
  if (filtered.length === 0) return null;
  return (
    <Alert severity='error' sx={{ mb: 1 }} data-testid='formErrorAlert'>
      <AlertTitle>
        {fixable ? FIXABLE_ERROR_HEADING : UNKNOWN_ERROR_HEADING}
      </AlertTitle>
      <ValidationErrorDisplay errors={errors} />
    </Alert>
  );
};

export default ErrorAlert;
