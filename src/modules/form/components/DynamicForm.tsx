import { forwardRef, useCallback, useImperativeHandle } from 'react';

import useFormDefinitionHandlers from '../hooks/useFormDefinitionHandlers';
import { FormValues, LocalConstants } from '../types';

import DirtyObserver from './DirtyObserver';
import RefactorFormBase, { RefactorFormBaseProps } from './RefactorFormBase';
import { FormDefinitionJson } from '@/types/gqlTypes';

interface DynamicFormSubmitInput {
  values: FormValues;
  confirmed?: boolean;
  event?: React.MouseEvent<HTMLButtonElement>;
  onSuccess?: VoidFunction;
  onError?: VoidFunction;
}

export type DynamicFormOnSubmit = (input: DynamicFormSubmitInput) => void;

export interface DynamicFormProps
  extends Omit<RefactorFormBaseProps, 'handlers'> {
  clientId?: string;
  definition: FormDefinitionJson;
  onSubmit: (input: DynamicFormSubmitInput) => void;
  onSaveDraft?: (values: FormValues, onSuccess?: VoidFunction) => void;
  onDirty?: (value: boolean) => void;
  initialValues?: Record<string, any>;
  localConstants?: LocalConstants;
}

export interface DynamicFormRef {
  SaveIfDirty: VoidFunction;
  SubmitIfDirty: (ignoreWarnings: boolean) => void;
  SubmitForm: VoidFunction;
}

const RefactorForm = forwardRef<DynamicFormRef, DynamicFormProps>(
  (
    {
      definition,
      onSubmit,
      onSaveDraft,
      onDirty,
      initialValues,
      errors: errorState,
      localConstants,
      ...props
    },
    ref
  ) => {
    const handlers = useFormDefinitionHandlers({
      definition,
      initialValues,
      localConstants,
    });

    const { getCleanedValues } = handlers;

    const handleSaveDraft = useCallback(() => {
      if (!onSaveDraft) return;
      onSaveDraft(getCleanedValues());
    }, [onSaveDraft, getCleanedValues]);

    const handleSubmit: DynamicFormOnSubmit = useCallback(
      (input) => {
        // console.log(input, handlers.getCleanedValues())
        onSubmit(input);
      },
      [onSubmit]
    );

    // Expose handle for parent components to initiate a background save (used for household workflow tabs)
    useImperativeHandle(
      ref,
      () => ({
        SubmitForm: () => {
          onSubmit({
            values: getCleanedValues(),
            confirmed: false,
          });
        },
        SaveIfDirty: () => {
          if (!handlers.methods.formState.isDirty || props.locked) return;
          handleSaveDraft();
        },
        SubmitIfDirty: (ignoreWarnings: boolean) => {
          if (!onSubmit || !handlers.methods.formState.isDirty || props.locked)
            return;
          onSubmit({
            values: getCleanedValues(),
            confirmed: ignoreWarnings,
            onSuccess: () => {},
          });
        },
      }),
      [onSubmit, getCleanedValues, props, handlers, handleSaveDraft]
    );

    return (
      <>
        {onDirty && <DirtyObserver onDirty={onDirty} handlers={handlers} />}
        <RefactorFormBase
          {...props}
          handlers={handlers}
          errors={errorState}
          onSubmit={handleSubmit}
          onSaveDraft={onSaveDraft ? handleSaveDraft : undefined}
        />
      </>
    );
  }
);

export default RefactorForm;
