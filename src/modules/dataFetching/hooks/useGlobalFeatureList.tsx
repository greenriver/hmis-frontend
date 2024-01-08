import { useGetGlobalFeaturesQuery } from '@/types/gqlTypes';

export function useGlobalFeatureList() {
  const {
    data: { enabledFeatures } = {},
    loading,
    error,
  } = useGetGlobalFeaturesQuery();
  if (error) throw error;

  return { enabledFeatures: enabledFeatures || [], loading } as const;
}
