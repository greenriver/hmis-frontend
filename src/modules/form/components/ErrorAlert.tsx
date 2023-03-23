import { Alert, AlertTitle } from '@mui/material';
import { reject } from 'lodash-es';

import ValidationErrorDisplay from './ValidationErrorDisplay';

import { ValidationError } from '@/types/gqlTypes';

const ErrorAlert = ({ errors }: { errors: ValidationError[] }) => {
  const filtered = reject(errors, ['severity', 'warning']);
  if (filtered.length === 0) return null;
  return (
    <Alert severity='error' sx={{ mb: 1 }} data-testid='formErrorAlert'>
      <AlertTitle>Please fix outstanding errors</AlertTitle>
      <ValidationErrorDisplay errors={errors} />
    </Alert>
  );
};

export default ErrorAlert;
