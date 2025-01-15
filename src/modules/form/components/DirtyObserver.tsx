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
 * DirtyObserver - A headless React component that  tracks the "dirty" state of a form (whether fields have been
 * modified from their initial values) and notifies parent components of state changes.
 */
const DirtyObserver: React.FC<DirtyObserverProps> = ({
  onDirty,
  handlers: {
    methods: { control },
  },
}) => {
  const { isDirty } = useFormState({ control });
  const prevDirty = usePrevious(isDirty);

  useEffect(() => {
    if (isDirty !== prevDirty) onDirty(isDirty);
  }, [isDirty, prevDirty, onDirty]);

  return null;
};

export default DirtyObserver;
