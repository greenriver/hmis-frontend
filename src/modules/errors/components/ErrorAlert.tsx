import { Alert, AlertProps, AlertTitle } from '@mui/material';
import { reject } from 'lodash-es';

import {
  ErrorRenderFn,
  FIXABLE_ERROR_HEADING,
  UNKNOWN_ERROR_HEADING,
} from '../util';

import ValidationErrorList from './ValidationErrorList';

import { ValidationError } from '@/types/gqlTypes';

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
      <ValidationErrorList errors={errors} renderError={renderError} />
    </Alert>
  );
};

export default ErrorAlert;
