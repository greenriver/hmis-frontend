import { Stack } from '@mui/material';
import { forwardRef } from 'react';

import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { ErrorState } from '@/modules/errors/util';

export interface DynamicFormErrorsProps {
  errors: ErrorState;
}

const DynamicFormErrors = forwardRef<HTMLDivElement, DynamicFormErrorsProps>(
  ({ errors: errorState }, ref) => {
    return (
      <Stack gap={2} ref={ref} component='div'>
        <ApolloErrorAlert error={errorState.apolloError} />
        <ErrorAlert errors={errorState.errors} fixable />
      </Stack>
    );
  }
);

export default DynamicFormErrors;
