import { fromPairs } from 'lodash-es';
import { useMemo } from 'react';

import { HouseholdAssesmentRole } from '../components/household/util';

import {
  AssessmentWithExtraToppingsFragment,
  useGetHouseholdAssessmentsQuery,
} from '@/types/gqlTypes';

interface Args {
  householdId: string;
  role: HouseholdAssesmentRole;
  assessmentId?: string;
}

export function useHouseholdAssessments({
  role,
  householdId,
  assessmentId,
}: Args) {
  const { data: { householdAssessments } = {}, ...status } =
    useGetHouseholdAssessmentsQuery({
      variables: {
        householdId,
        assessmentRole: role,
        assessmentId,
      },
      fetchPolicy: 'cache-and-network',
    });

  const assessmentByEnrollmentId = useMemo(() => {
    if (!householdAssessments) return;
    const pairs = householdAssessments.map(({ enrollment, ...assessment }) => [
      enrollment.id,
      assessment,
    ]);
    return fromPairs(pairs) as Record<
      string,
      AssessmentWithExtraToppingsFragment | undefined
    >;
  }, [householdAssessments]);
  return { householdAssessments, assessmentByEnrollmentId, ...status } as const;
}
