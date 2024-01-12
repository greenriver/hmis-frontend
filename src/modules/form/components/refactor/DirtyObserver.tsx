import React, { useEffect } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import { FormDefinitionHandlers } from './useFormDefinitionHandlers';
import usePrevious from '@/hooks/usePrevious';

export interface DirtyObserverProps {
  onDirty: (dirty: boolean) => any;
  handlers: FormDefinitionHandlers;
  fields?: string[];
}

const DirtyObserver: React.FC<DirtyObserverProps> = ({
  onDirty,
  handlers: {
    methods: { control },
  },
  fields,
}) => {
  const { isDirty, dirtyFields, defaultValues } = useFormState({
    control,
    name: fields,
  });
  const prevDirty = usePrevious(isDirty);
  const values = useWatch({ control });

  console.log({ isDirty, prevDirty, dirtyFields, defaultValues, values });

  useEffect(() => {
    if (isDirty !== prevDirty) onDirty(isDirty);
  }, [isDirty, prevDirty, onDirty]);

  return null;
};

export default DirtyObserver;
