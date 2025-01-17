import { uniq } from 'lodash-es';
import React, { ReactNode, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { FormDefinitionHandlers } from '../hooks/useFormDefinitionHandlers';
import { FormValues } from '@/modules/form/types';
import { getAllChildLinkIds } from '@/modules/form/util/formUtil';
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
    const childs = getAllChildLinkIds(item);
    const deps = boundsInvertedDependencyMap[item.linkId] || [];
    return uniq([item.linkId, ...childs, ...deps]);
  }, [item, boundsInvertedDependencyMap]);

  const valueArray = useWatch({
    control: handlers.methods.control,
    name: watchFields,
  });

  const values = useMemo(
    () =>
      watchFields.reduce(
        (acc, fieldName, index) => ({
          ...acc,
          [fieldName]: valueArray[index],
        }),
        {}
      ),
    [watchFields, valueArray]
  );

  return children(values);
};

export default ValueWrapper;
