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
  const { dirtyFields } = useFormState({ control });
  // detect dirty state using dirtyFields rather than isDirty. It seems that isDirty is not always reliable or 1:1 with dirtyFields
  const anyDirtyFields = Object.values(dirtyFields).length > 0;
  const prevDirty = usePrevious(anyDirtyFields);

  useEffect(() => {
    if (anyDirtyFields !== prevDirty) {
      //console.info(`form for client ${clientId} became`, anyDirtyFields ? 'dirty' : 'clean')
      onDirty(anyDirtyFields);
    }
  }, [anyDirtyFields, prevDirty, onDirty]);

  return null;
};

export default DirtyObserver;
