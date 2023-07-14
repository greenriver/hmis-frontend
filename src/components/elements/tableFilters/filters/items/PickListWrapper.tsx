import { QueryHookOptions } from '@apollo/client';
import React from 'react';

import { PickListArgs } from '@/modules/form/types';
import {
  GetPickListQuery,
  GetPickListQueryVariables,
  PickListOption,
  PickListType,
  useGetPickListQuery,
} from '@/types/gqlTypes';

export type PickListWrapperProps = {
  pickListType: PickListType;
  pickListArgs?: PickListArgs;
  fetchOptions?: QueryHookOptions<GetPickListQuery, GetPickListQueryVariables>;
  children: (options: PickListOption[], loading: boolean) => JSX.Element;
};

const PickListWrapper: React.FC<PickListWrapperProps> = ({
  pickListType,
  pickListArgs,
  fetchOptions = {},
  children,
}) => {
  const { data, loading } = useGetPickListQuery({
    variables: {
      pickListType,
      ...pickListArgs,
    },
    ...fetchOptions,
  });

  return children(data?.pickList || [], loading);
};

export default PickListWrapper;
