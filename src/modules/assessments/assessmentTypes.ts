import { GetClientAssessmentsQuery } from '@/types/gqlTypes';

export type ClientAssessmentType = NonNullable<
  NonNullable<GetClientAssessmentsQuery['client']>['assessments']
>['nodes'][0];
