import { QueryHookOptions } from '@apollo/client';
import React from 'react';

import {
  GetPickListQuery,
  GetPickListQueryVariables,
  PickListOption,
  PickListType,
  useGetPickListQuery,
} from '@/types/gqlTypes';

export type PickListWrapperProps = {
  pickListType: PickListType;
  relationId?: string;
  fetchOptions?: QueryHookOptions<GetPickListQuery, GetPickListQueryVariables>;
  children: (options: PickListOption[], loading: boolean) => JSX.Element;
};

const PickListWrapper: React.FC<PickListWrapperProps> = ({
  pickListType,
  relationId,
  fetchOptions = {},
  children,
}) => {
  const { data, loading } = useGetPickListQuery({
    variables: {
      pickListType,
      relationId,
    },
    ...fetchOptions,
  });

  return children(data?.pickList || [], loading);
};

export default PickListWrapper;
