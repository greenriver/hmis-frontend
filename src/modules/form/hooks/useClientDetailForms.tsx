import { useClientDetailFormsQuery } from '@/types/gqlTypes';

export function useClientDetailForms() {
  const { data, error, loading } = useClientDetailFormsQuery();

  if (error) throw error;

  return {
    forms: data?.clientDetailForms || [],
    loading,
  } as const;
}
