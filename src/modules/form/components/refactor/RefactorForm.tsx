import { BaseSyntheticEvent, useCallback } from 'react';

import { FormValues, LocalConstants } from '../../types';

import DirtyObserver from './DirtyObserver';
import RefactorFormBase, { RefactorFormBaseProps } from './RefactorFormBase';
import useFormDefinitionHandlers from './useFormDefinitionHandlers';
import { FormDefinitionJson } from '@/types/gqlTypes';

interface DynamicFormSubmitInput {
  values: FormValues;
  confirmed?: boolean;
  event?: BaseSyntheticEvent;
  onSuccess?: VoidFunction;
  onError?: VoidFunction;
}

export type DynamicFormOnSubmit = (input: DynamicFormSubmitInput) => void;

export interface DynamicFormProps extends RefactorFormBaseProps {
  clientId?: string;
  definition: FormDefinitionJson;
  onSubmit: (input: DynamicFormSubmitInput) => void;
  onSaveDraft?: (values: FormValues, onSuccess?: VoidFunction) => void;
  onDirty?: (value: boolean) => void;
  initialValues?: Record<string, any>;
  localConstants?: LocalConstants;
}

const DynamicForm = ({
  definition,
  onSubmit,
  onSaveDraft,
  onDirty,
  initialValues,
  errors: errorState,
  localConstants,
  ...props
}: DynamicFormProps) => {
  const handlers = useFormDefinitionHandlers({
    definition,
    initialValues,
    localConstants,
    onSubmit: (...args) => console.log({ args }),
  });

  const { getCleanedValues } = handlers;

  const handleSaveDraft = useCallback(() => {
    if (!onSaveDraft) return;
    onSaveDraft(getCleanedValues());
  }, [onSaveDraft, getCleanedValues]);

  return (
    <>
      {onDirty && <DirtyObserver onDirty={onDirty} handlers={handlers} />}
      <RefactorFormBase
        {...props}
        handlers={handlers}
        errors={errorState}
        onSubmit={(e) => console.log('SUBMIT', e)}
        onSaveDraft={onSaveDraft ? handleSaveDraft : undefined}
      />
    </>
  );
};

export default DynamicForm;
