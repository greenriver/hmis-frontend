import { uniq } from 'lodash-es';
import React, { ReactNode, useMemo } from 'react';

import { FormDefinitionHandlers } from '../hooks/useFormDefinitionHandlers';
import { useDynamicFieldWatchValues } from '@/modules/form/hooks/rhf/useDynamicFieldWatchValues';
import { FormValues } from '@/modules/form/types';
import { FormItem } from '@/types/gqlTypes';

export type ValueWrapperProps = {
  item: FormItem;
  handlers: FormDefinitionHandlers;
  children: (value: FormValues) => ReactNode;
};

/**
 * Wraps form fields to isolate re-renders.
 *
 * It uses react-hook-form's useWatch to track field value changes and only re-render when those specific fields change.
 */
const ValueWrapper: React.FC<ValueWrapperProps> = ({
  item,
  handlers,
  children,
}) => {
  const { boundsInvertedDependencyMap } = handlers;

  const watchFields = useMemo(() => {
    const deps = boundsInvertedDependencyMap[item.linkId] || [];
    return uniq([item.linkId, ...deps]);
  }, [item, boundsInvertedDependencyMap]);

  const values = useDynamicFieldWatchValues(watchFields);

  return children(values);
};

export default ValueWrapper;
