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
  assessmentId?: string;
  skip?: boolean;
}

type AssessmentResultType = NonNullable<
  NonNullable<GetHouseholdAssessmentsQuery['householdAssessments']>
>[0];

export function useHouseholdAssessments({
  role,
  householdId,
  assessmentId,
  skip,
}: Args) {
  const { data: { householdAssessments } = {}, ...status } =
    useGetHouseholdAssessmentsQuery({
      variables: {
        householdId,
        assessmentRole: role,
        assessmentId,
      },
      skip,
      fetchPolicy: 'cache-and-network',
    });

  const assessmentByEnrollmentId = useMemo(() => {
    if (!householdAssessments) return;
    const pairs = householdAssessments.map(({ enrollment, ...assessment }) => [
      enrollment.id,
      assessment,
    ]);
    return fromPairs(pairs) as Record<string, AssessmentResultType | undefined>;
  }, [householdAssessments]);

  return { householdAssessments, assessmentByEnrollmentId, ...status } as const;
}
