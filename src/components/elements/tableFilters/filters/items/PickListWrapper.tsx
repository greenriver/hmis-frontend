import React from 'react';

import { PickListFetchOptions } from '@/modules/form/hooks/usePickList';
import { PickListArgs } from '@/modules/form/types';
import {
  PickListOption,
  PickListType,
  useGetPickListQuery,
} from '@/types/gqlTypes';

export type PickListWrapperProps = {
  pickListType: PickListType;
  pickListArgs?: PickListArgs;
  fetchOptions?: PickListFetchOptions;
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
