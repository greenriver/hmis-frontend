import { fromPairs } from 'lodash-es';
import { useMemo } from 'react';

import { HouseholdAssesmentRole } from '../components/household/util';

import {
  GetHouseholdAssessmentsQuery,
  useGetHouseholdAssessmentsQuery,
} from '@/types/gqlTypes';

interface Args {
  householdId: string;
  role: HouseholdAssesmentRole;
  skip?: boolean;
}

type HhmAssessmentType = NonNullable<
  NonNullable<GetHouseholdAssessmentsQuery['household']>['assessments']
>['nodes'][0];

export function useHouseholdAssessments({ role, householdId, skip }: Args) {
  const { data: { household } = {}, ...status } =
    useGetHouseholdAssessmentsQuery({
      variables: {
        id: householdId,
        filters: { assessmentName: [role] },
        limit: 30,
      },
      skip,
      fetchPolicy: 'cache-and-network',
    });

  const householdAssessments = useMemo(() => {
    if (!household || !household.assessments) return;
    return household.assessments.nodes;
  }, [household]);

  const assessmentByEnrollmentId = useMemo(() => {
    if (!householdAssessments) return;
    const pairs = householdAssessments.map(({ enrollment, ...assessment }) => [
      enrollment.id,
      assessment,
    ]);
    return fromPairs(pairs) as Record<string, HhmAssessmentType | undefined>;
  }, [householdAssessments]);

  return { householdAssessments, assessmentByEnrollmentId, ...status } as const;
}
