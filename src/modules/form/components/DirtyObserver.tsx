import React, { useEffect } from 'react';
import { useFormState } from 'react-hook-form';
import { FormDefinitionHandlers } from '../hooks/useFormDefinitionHandlers';
import usePrevious from '@/hooks/usePrevious';

export interface DirtyObserverProps {
  onDirty: (dirty: boolean) => any;
  handlers: FormDefinitionHandlers;
  fields?: string[];
}

/**
 * DirtyObserver - A headless React component that monitors form field modifications.
 *
 * This component tracks the "dirty" state of a form (whether fields have been modified
 * from their initial values) and notifies parent components of state changes. It can
 * observe either an entire form or specific fields.
 *
 */
const DirtyObserver: React.FC<DirtyObserverProps> = ({
  onDirty,
  handlers: {
    methods: { control },
  },
  fields,
}) => {
  const { isDirty } = useFormState({
    control,
    name: fields,
  });
  const prevDirty = usePrevious(isDirty);

  useEffect(() => {
    if (isDirty !== prevDirty) onDirty(isDirty);
  }, [isDirty, prevDirty, onDirty]);

  return null;
};

export default DirtyObserver;
