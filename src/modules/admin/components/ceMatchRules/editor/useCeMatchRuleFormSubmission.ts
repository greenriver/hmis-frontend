import { useCallback, useState } from 'react';

import { CeMatchRuleFormValues } from './ceMatchRuleFormUtil';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import {
  CeMatchRuleDetailsFragment,
  CeMatchRuleInput,
  CeMatchRuleOwnerType,
  CeMatchRuleType,
  ValidationError,
  useCreateCeMatchRuleMutation,
  useUpdateCeMatchRuleMutation,
} from '@/types/gqlTypes';

const buildCeMatchRuleInput = (
  {
    name,
    mode,
    structuredExpression,
    freeTextExpression,
  }: CeMatchRuleFormValues,
  ownerType?: CeMatchRuleOwnerType,
  ownerId?: string
): CeMatchRuleInput => {
  const base = {
    name: name.trim(),
    ownerId,
    ownerType,
    ruleType: CeMatchRuleType.EligibilityRequirement,
  };

  if (mode === 'freeText') {
    return {
      ...base,
      expression: freeTextExpression.trim(),
    };
  }

  return {
    ...base,
    structuredExpression: {
      operator: structuredExpression.operator,
      clauses: structuredExpression.clauses.map(
        // Strip out unneeded fields from the draft clause.
        ({ field, comparator, value }) => ({
          field,
          comparator,
          value,
        })
      ),
    },
  };
};

interface UseCeMatchRuleFormSubmissionArgs {
  ownerType: CeMatchRuleOwnerType;
  ownerId?: string;
  ruleId?: string;
  onSaved: (rule: CeMatchRuleDetailsFragment) => void;
}

const useCeMatchRuleFormSubmission = ({
  ownerType,
  ownerId,
  ruleId,
  onSaved,
}: UseCeMatchRuleFormSubmissionArgs) => {
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  const handleCompleted = useCallback(
    (
      payload?: {
        rule?: CeMatchRuleDetailsFragment | null;
        errors: ValidationError[];
      } | null
    ) => {
      if (payload?.rule) {
        setErrorState(emptyErrorState);
        onSaved(payload.rule);
      } else if (payload?.errors?.length) {
        setErrorState(partitionValidations(payload.errors));
      }
    },
    [onSaved]
  );

  const [createCeMatchRule, { loading: createLoading }] =
    useCreateCeMatchRuleMutation({
      onCompleted: (data) => {
        handleCompleted(data.createCeMatchRule);
      },
      onError: (apolloError) =>
        setErrorState({ ...emptyErrorState, apolloError }),
    });

  const [updateCeMatchRule, { loading: updateLoading }] =
    useUpdateCeMatchRuleMutation({
      onCompleted: (data) => {
        handleCompleted(data.updateCeMatchRule);
      },
      onError: (apolloError) =>
        setErrorState({ ...emptyErrorState, apolloError }),
    });

  const submit = useCallback(
    (values: CeMatchRuleFormValues, confirmed = false) => {
      const input = buildCeMatchRuleInput(values, ownerType, ownerId);
      if (ruleId) {
        updateCeMatchRule({
          variables: {
            id: ruleId,
            input,
            confirmed,
          },
        });
      } else {
        createCeMatchRule({
          variables: {
            input,
            confirmed,
          },
        });
      }
    },
    [createCeMatchRule, ownerId, ownerType, ruleId, updateCeMatchRule]
  );

  return {
    errorState,
    loading: createLoading || updateLoading,
    submit,
    clearErrors: () => setErrorState(emptyErrorState),
  };
};

export default useCeMatchRuleFormSubmission;
