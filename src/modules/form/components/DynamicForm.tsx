import { forwardRef, useCallback, useImperativeHandle } from 'react';

import useFormDefinitionHandlers, {
  FormDefinitionHandlers,
} from '../hooks/useFormDefinitionHandlers';
import { FormValues, LocalConstants } from '../types';

import DirtyObserver from './DirtyObserver';
import DynamicFormBase, { DynamicFormBaseProps } from './DynamicFormBase';
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
  extends Omit<DynamicFormBaseProps, 'handlers'> {
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

export const DynamicFormWithoutHandlers = forwardRef<
  DynamicFormRef,
  DynamicFormProps & { handlers: FormDefinitionHandlers }
>(
  (
    {
      definition,
      onSubmit,
      onSaveDraft,
      onDirty,
      initialValues,
      errors: errorState,
      localConstants,
      handlers,
      ...props
    },
    ref
  ) => {
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
        <DynamicFormBase
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

const DynamicFormWithHandlers = forwardRef<
  DynamicFormRef,
  Omit<DynamicFormProps, 'handlers'>
>((props, ref) => {
  const { definition, initialValues, localConstants } = props;
  const handlers = useFormDefinitionHandlers({
    definition,
    initialValues,
    localConstants,
  });

  return (
    <DynamicFormWithoutHandlers {...props} handlers={handlers} ref={ref} />
  );
});

export default DynamicFormWithHandlers;
