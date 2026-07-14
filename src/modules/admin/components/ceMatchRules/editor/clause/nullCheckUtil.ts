import { CeMatchRuleComparator } from '@/types/gqlTypes';

export type CeMatchNullCheck = 'HAS_VALUE' | 'DOES_NOT_HAVE_VALUE';

export const NULL_CHECK_OPTIONS: { code: CeMatchNullCheck; label: string }[] =
  [
    { code: 'HAS_VALUE', label: 'Has a value' },
    { code: 'DOES_NOT_HAVE_VALUE', label: 'Does not have a value' },
  ];

export const nullCheckForClause = (
  comparator?: CeMatchRuleComparator | null,
  value?: unknown
): CeMatchNullCheck | undefined => {
  if (value !== null) return undefined;
  if (comparator === CeMatchRuleComparator.NotEq) return 'HAS_VALUE';
  if (comparator === CeMatchRuleComparator.Eq) return 'DOES_NOT_HAVE_VALUE';
};

export const clauseForNullCheck = (check: CeMatchNullCheck) => ({
  comparator:
    check === 'HAS_VALUE'
      ? CeMatchRuleComparator.NotEq
      : CeMatchRuleComparator.Eq,
  value: null,
});

export const isNullCheckClause = (
  comparator?: CeMatchRuleComparator | null,
  value?: unknown
): boolean => nullCheckForClause(comparator, value) !== undefined;
