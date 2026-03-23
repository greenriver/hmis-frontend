import { useMemo } from 'react';
import {
  ClientSearchInput,
  GetSearchQueryQuery,
  useGetSearchQueryQuery,
} from '@/types/gqlTypes';

interface Props {
  searchQueryId?: string;
  user?: any;
  onCompleted?: (input: ClientSearchInput) => void;
}

type Result = {
  resolvedParams: ClientSearchInput;
  loading: boolean;
};

const transformDataToInput = (
  data: GetSearchQueryQuery['searchQuery']
): ClientSearchInput => {
  const result: ClientSearchInput = {};
  if (data?.textSearch) result.textSearch = data.textSearch;
  if (data?.personalId) result.personalId = data.personalId;
  if (data?.warehouseId) result.warehouseId = data.warehouseId;
  if (data?.firstName) result.firstName = data.firstName;
  if (data?.lastName) result.lastName = data.lastName;
  if (data?.ssnSerial) result.ssnSerial = data.ssnSerial;
  if (data?.dob) result.dob = data.dob;
  return result;
};

const useResolvedSearchQueryId = ({
  searchQueryId,
  onCompleted,
}: Props): Result => {
  const skip = !searchQueryId;

  const { data, loading, error } = useGetSearchQueryQuery({
    variables: { id: searchQueryId || '' },
    skip,
    // cache-first is Apollo's default; Setting it explicitly to call out that having this uuid in the cache already is likely
    // if the user is navigating with the back-button, so we don't want to hit the network again in that case
    fetchPolicy: 'cache-first',
    onCompleted: (data) =>
      onCompleted?.(transformDataToInput(data?.searchQuery)),
  });

  if (error) throw error;

  const result = useMemo(() => {
    return transformDataToInput(data?.searchQuery);
  }, [data?.searchQuery]);

  return {
    resolvedParams: result,
    loading: skip ? false : loading,
  };
};

export default useResolvedSearchQueryId;
