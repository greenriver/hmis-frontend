import { Alert, AlertProps, AlertTitle } from '@mui/material';
import { find, reject } from 'lodash-es';

import {
  ErrorRenderFn,
  FIXABLE_ERROR_HEADING,
  UNKNOWN_VALIDATION_ERROR_HEADING,
} from '../util';

import ValidationErrorList from './ValidationErrorList';

import { ValidationError, ValidationType } from '@/types/gqlTypes';

const ErrorAlert = ({
  errors,
  fixable = false,
  AlertProps = {},
  renderError,
}: {
  errors: ValidationError[];
  fixable?: boolean;
  AlertProps?: AlertProps;
  renderError?: ErrorRenderFn;
}) => {
  const filtered = reject(errors, ['severity', 'warning']);
  if (filtered.length === 0) return null;

  let title = fixable
    ? FIXABLE_ERROR_HEADING
    : UNKNOWN_VALIDATION_ERROR_HEADING;

  // If error list contains a server_error, dont show the 'Please fix..' title
  if (find(errors, { type: ValidationType.ServerError })) {
    title = UNKNOWN_VALIDATION_ERROR_HEADING;
  }
  return (
    <Alert
      severity='error'
      sx={{ mb: 1 }}
      data-testid='formErrorAlert'
      {...AlertProps}
    >
      <AlertTitle>{title}</AlertTitle>
      <ValidationErrorList errors={errors} renderError={renderError} />
    </Alert>
  );
};

export default ErrorAlert;
