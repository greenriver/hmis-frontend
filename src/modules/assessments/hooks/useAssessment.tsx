import { useGetAssessmentQuery } from '@/types/gqlTypes';

export function useAssessment(assessmentId?: string) {
  const {
    data: assessmentData,
    loading: assessmentLoading,
    error: assessmentError,
  } = useGetAssessmentQuery({
    variables: { id: assessmentId as string },
    skip: !assessmentId, // skip if creating a new assessment
  });

  if (assessmentError) throw assessmentError;

  return {
    assessment: assessmentData?.assessment || undefined,
    loading: assessmentLoading,
  } as const;
}
