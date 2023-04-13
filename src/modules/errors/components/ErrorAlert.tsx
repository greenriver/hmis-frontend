import { Alert, AlertProps, AlertTitle } from '@mui/material';
import { reject } from 'lodash-es';

import ValidationErrorList from './ValidationErrorList';

import { ValidationError } from '@/types/gqlTypes';

const FIXABLE_ERROR_HEADING = 'Please fix outstanding errors';
const UNKNOWN_ERROR_HEADING = 'An error occurred';

const ErrorAlert = ({
  errors,
  fixable = true,
  AlertProps = {},
}: {
  errors: ValidationError[];
  fixable?: boolean;
  AlertProps?: AlertProps;
}) => {
  const filtered = reject(errors, ['severity', 'warning']);
  if (filtered.length === 0) return null;
  return (
    <Alert
      severity='error'
      sx={{ mb: 1 }}
      data-testid='formErrorAlert'
      {...AlertProps}
    >
      <AlertTitle>
        {fixable ? FIXABLE_ERROR_HEADING : UNKNOWN_ERROR_HEADING}
      </AlertTitle>
      <ValidationErrorList errors={errors} />
    </Alert>
  );
};

export default ErrorAlert;
