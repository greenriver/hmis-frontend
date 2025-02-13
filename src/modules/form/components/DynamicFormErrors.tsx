import { Stack } from '@mui/material';
import { forwardRef } from 'react';

import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { ErrorFilterFn, ErrorState, hasErrors } from '@/modules/errors/util';

export interface DynamicFormErrorsProps {
  errors: ErrorState;
  errorFilter?: ErrorFilterFn;
}

const DynamicFormErrors = forwardRef<HTMLDivElement, DynamicFormErrorsProps>(
  ({ errors: errorState, errorFilter }, ref) => {
    if (!hasErrors(errorState)) return;

    return (
      <Stack gap={2} ref={ref} component='div'>
        <ApolloErrorAlert error={errorState.apolloError} />
        <ErrorAlert
          errors={errorState.errors}
          errorFilter={errorFilter}
          fixable
        />
      </Stack>
    );
  }
);

export default DynamicFormErrors;
