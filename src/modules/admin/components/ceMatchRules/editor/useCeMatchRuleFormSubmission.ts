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

const buildStructuredExpressionInput = ({
  operator,
  clauses,
}: CeMatchRuleFormValues['structuredExpression']) => ({
  operator,
  clauses: clauses.map(
    // Strip out unneeded fields from the draft clause.
    ({ field, comparator, value }) => ({
      field,
      comparator,
      value,
    })
  ),
});

const buildCreateCeMatchRuleInput = (
  {
    name,
    mode,
    structuredExpression,
    freeTextExpression,
    projectTypes,
    funders,
  }: CeMatchRuleFormValues,
  ownerType?: CeMatchRuleOwnerType,
  ownerId?: string
): CeMatchRuleInput => {
  const base = {
    name: name.trim(),
    ownerId,
    ownerType,
    ruleType: CeMatchRuleType.EligibilityRequirement,
    projectTypes,
    funders,
  };

  if (mode === 'freeText') {
    return {
      ...base,
      expression: freeTextExpression.trim(),
    };
  }

  return {
    ...base,
    structuredExpression: buildStructuredExpressionInput(structuredExpression),
  };
};

interface BuildUpdateCeMatchRuleInputArgs {
  expressionDirty?: boolean;
}

const buildUpdateCeMatchRuleInput = (
  {
    name,
    mode,
    structuredExpression,
    freeTextExpression,
    projectTypes,
    funders,
  }: CeMatchRuleFormValues,
  { expressionDirty = false }: BuildUpdateCeMatchRuleInputArgs = {}
): CeMatchRuleInput => {
  // Updates intentionally avoid create-only immutable fields (owner/type/ruleType).
  // Only send expression when the editor value changed, so switching modes or updating name
  // does not rewrite equivalent saved expressions or trigger impact preview.
  const input: CeMatchRuleInput = {
    name: name.trim(),
    projectTypes,
    funders,
  };

  if (!expressionDirty) return input;

  if (mode === 'freeText') {
    return {
      ...input,
      expression: freeTextExpression.trim(),
    };
  }

  return {
    ...input,
    structuredExpression: buildStructuredExpressionInput(structuredExpression),
  };
};

interface UseCeMatchRuleFormSubmissionArgs {
  ownerType: CeMatchRuleOwnerType;
  ownerId?: string;
  ruleId?: string;
  onSaved: (rule: CeMatchRuleDetailsFragment) => void;
}

interface SubmitCeMatchRuleArgs {
  confirmed?: boolean;
  expressionDirty?: boolean;
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
    (
      values: CeMatchRuleFormValues,
      { confirmed = false, expressionDirty = false }: SubmitCeMatchRuleArgs = {}
    ) => {
      if (ruleId) {
        updateCeMatchRule({
          variables: {
            id: ruleId,
            input: buildUpdateCeMatchRuleInput(values, {
              expressionDirty,
            }),
            confirmed,
          },
        });
      } else {
        createCeMatchRule({
          variables: {
            input: buildCreateCeMatchRuleInput(values, ownerType, ownerId),
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
