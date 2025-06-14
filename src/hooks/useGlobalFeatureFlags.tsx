import {
  GlobalFeatureFlagFieldsFragment,
  useGetGlobalFeatureFlagsQuery,
} from '@/types/gqlTypes';

type ReturnType = {
  globalFeatureFlags?: GlobalFeatureFlagFieldsFragment;
  loading: boolean;
};
export function useGlobalFeatureFlags(): ReturnType {
  // Note: feature flags are loaded in the main layout, so subsequent usages of this hook should only hit the cache and not the server.
  const {
    loading,
    error,
    data: { globalFeatureFlags } = {},
  } = useGetGlobalFeatureFlagsQuery();

  if (error) throw error;

  return { globalFeatureFlags, loading };
}
