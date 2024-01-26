import { Stack } from '@mui/material';
import { forwardRef } from 'react';

import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { ErrorState } from '@/modules/errors/util';

export interface RefactorFormErrorsProps {
  errors: ErrorState;
}

const RefactorFormErrors = forwardRef(
  ({ errors: errorState }: RefactorFormErrorsProps, ref) => {
    return (
      <Stack gap={2} ref={ref}>
        <ApolloErrorAlert error={errorState.apolloError} />
        <ErrorAlert errors={errorState.errors} fixable />
      </Stack>
    );
  }
);

export default RefactorFormErrors;
