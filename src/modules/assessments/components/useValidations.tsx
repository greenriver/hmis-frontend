import { useMemo } from 'react';

import { ValidationError, ValidationSeverity } from '@/types/gqlTypes';

export function useValidations(validations?: ValidationError[]) {
  const errors = useMemo(
    () =>
      (validations || []).filter(
        (e) => e.severity === ValidationSeverity.Error
      ),
    [validations]
  );

  const warnings = useMemo(
    () =>
      (validations || []).filter(
        (e) => e.severity === ValidationSeverity.Warning
      ),
    [validations]
  );
  return { errors, warnings };
}
