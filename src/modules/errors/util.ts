import { ApolloError, ServerError, ServerParseError } from '@apollo/client';
import { partition } from 'lodash-es';

import { CustomFetchNetworkError } from '@/app/apolloClient';
import { ValidationError, ValidationSeverity } from '@/types/gqlTypes';

// This message is shown for unhandled exceptions
export const UNKNOWN_ERROR_HEADING =
  'An error occurred on this page. The error has been reported and will be investigated by our support team. Please reload the page and try again. Contact your administrator if the problem persists.';
// This message is shown along form ValidationErrors that can be fixed
export const FIXABLE_ERROR_HEADING = 'Please fix outstanding errors';
// This message is shown along form ValidationErrors that may not be fixable or have type server_error
// Note: we don't show the long message because we do NOT get notified about these
export const UNKNOWN_VALIDATION_ERROR_HEADING = 'An error occurred';

export const isApolloError = (err: Error | ApolloError): err is ApolloError => {
  return !!(err instanceof Error && err.hasOwnProperty('graphQLErrors'));
};

export const isServerError = (
  err: Error | ServerParseError | ServerError | null
): err is ServerError => {
  return !!(err && err instanceof Error && err.hasOwnProperty('result'));
};

export const hasStatusCode = (
  err: Error | ServerParseError | ServerError | CustomFetchNetworkError | null
): err is CustomFetchNetworkError | ServerError => {
  return !!(err && err instanceof Error && 'statusCode' in err);
};

/*** Error State helpers for storing all relevant error state  */
export type ErrorState = {
  apolloError?: ApolloError;
  errors: ValidationError[];
  warnings: ValidationError[];
};

export type ErrorRenderFn = (
  e: ValidationError,
  args?: { attributeOnly?: boolean }
) => React.ReactNode;

export const hasAnyValue = (state: ErrorState): boolean =>
  !!state.apolloError || state.errors.length > 0 || state.warnings.length > 0;

export const hasErrors = (state: ErrorState): boolean =>
  !!state.apolloError || state.errors.length > 0;

export const hasOnlyWarnings = (state: ErrorState): boolean =>
  !state.apolloError && state.errors.length === 0 && state.warnings.length > 0;

export const emptyErrorState: ErrorState = {
  apolloError: undefined,
  errors: [],
  warnings: [],
};

export const partitionValidations: (
  validations: ValidationError[]
) => ErrorState = (validations: ValidationError[]): ErrorState => {
  const split = partition(validations, { severity: ValidationSeverity.Error });
  return {
    errors: split[0],
    warnings: split[1],
  };
};

export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
