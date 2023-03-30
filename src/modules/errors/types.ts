import { ApolloError, ServerError, ServerParseError } from '@apollo/client';
import { partition } from 'lodash-es';

import { ValidationError, ValidationSeverity } from '@/types/gqlTypes';

export const isApolloError = (err: Error | ApolloError): err is ApolloError => {
  return !!(err instanceof Error && err.hasOwnProperty('graphQLErrors'));
};

export const isServerError = (
  err: Error | ServerParseError | ServerError | null
): err is ServerError => {
  return !!(err && err instanceof Error && err.hasOwnProperty('result'));
};

export type ErrorState = {
  apolloError?: ApolloError;
  errors: ValidationError[];
  warnings: ValidationError[];
};

export const hasAnyValue = (state: ErrorState) =>
  state.apolloError || state.errors.length > 0 || state.warnings.length > 0;

export const hasErrors = (state: ErrorState) =>
  state.apolloError || state.errors.length > 0;

export const hasOnlyWarnings = (state: ErrorState) =>
  !state.apolloError && state.errors.length == 0 && state.warnings.length > 0;

export const emptyErrorState = {
  apolloError: undefined,
  errors: [],
  warnings: [],
};

export const partitionValidations = (validations: ValidationError[]) => {
  const split = partition(validations, { severity: ValidationSeverity.Error });
  return {
    errors: split[0],
    warnings: split[1],
  };
};
