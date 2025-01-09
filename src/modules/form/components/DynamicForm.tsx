import { forwardRef, useCallback, useImperativeHandle } from 'react';

import useFormDefinitionHandlers, {
  FormDefinitionHandlers,
} from '../hooks/useFormDefinitionHandlers';
import { FormValues, LocalConstants } from '../types';

import DirtyObserver from './DirtyObserver';
import DynamicFormBase, { DynamicFormBaseProps } from './DynamicFormBase';
import { FormDefinitionJson } from '@/types/gqlTypes';

interface DynamicFormSubmitInput {
  rawValues: FormValues; // // Example: { 'favorite_color': { code: 'light_blue', label: 'Light Blue' }, 'assessment_date': <JS Date Object> }
  valuesByLinkId: FormValues; // Example: { 'favorite_color': 'light_blue', 'assessment_date': '2020-09-01' }
  valuesByFieldName: FormValues; // Example: { 'Client.favorite_color_field_key': 'light_blue', 'assessmentDate': '2020-09-01', 'someOtherHiddenField': '_HIDDEN' }
  confirmed?: boolean;
  event?: React.MouseEvent<HTMLButtonElement>;
  onSuccess?: VoidFunction;
  onError?: VoidFunction;
}

interface DynamicFormSaveDraftInput {
  rawValues: FormValues;
  valuesByLinkId: FormValues;
  valuesByFieldName: FormValues;
  onSuccess?: VoidFunction;
  onError?: VoidFunction;
}

export type DynamicFormOnSubmit = (input: DynamicFormSubmitInput) => void;
export type DynamicFormOnSaveDraft = (input: DynamicFormSaveDraftInput) => void;

export interface DynamicFormProps
  extends Omit<DynamicFormBaseProps, 'handlers' | 'onSaveDraft'> {
  clientId?: string;
  definition: FormDefinitionJson;
  onSubmit: (input: DynamicFormSubmitInput) => void;
  onSaveDraft?: DynamicFormOnSaveDraft;
  onDirty?: (value: boolean) => void;
  initialValues?: Record<string, any>;
  localConstants?: LocalConstants;
  variant?: 'standard' | 'without_top_level_cards';
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
    const { getValuesForSubmit, resetDirty } = handlers;

    const handleSaveDraft = useCallback(() => {
      if (!onSaveDraft) return;
      onSaveDraft({
        ...getValuesForSubmit(),
        onSuccess: () => resetDirty(),
      });
    }, [onSaveDraft, getValuesForSubmit, resetDirty]);

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
          // onSubmit({ values: getCleanedValues(), confirmed: false, });
          onSubmit({ ...getValuesForSubmit(), confirmed: false });
        },
        SaveIfDirty: () => {
          if (!handlers.methods.formState.isDirty || props.locked) return;
          handleSaveDraft();
        },
        SubmitIfDirty: (ignoreWarnings: boolean) => {
          if (!onSubmit || !handlers.methods.formState.isDirty || props.locked)
            return;
          onSubmit({
            //values: getCleanedValues(),
            ...getValuesForSubmit(),
            confirmed: ignoreWarnings,
            onSuccess: () => {},
          });
        },
      }),
      [onSubmit, getValuesForSubmit, props, handlers, handleSaveDraft]
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
    errors: props.errors.errors,
  });

  return (
    <DynamicFormWithoutHandlers {...props} handlers={handlers} ref={ref} />
  );
});

export default DynamicFormWithHandlers;
