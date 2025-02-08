import { forwardRef, useCallback, useImperativeHandle } from 'react';

import { DefaultValues, FormProvider } from 'react-hook-form';
import useFormDefinitionHandlers, {
  FormDefinitionHandlers,
} from '../hooks/useFormDefinitionHandlers';
import { FormValues, LocalConstants } from '../types';

import DirtyObserver from './DirtyObserver';
import DynamicFormBase, { DynamicFormBaseProps } from './DynamicFormBase';
import Loading from '@/components/elements/Loading';
import { useEnrichedFormData } from '@/modules/form/hooks/rhf/useEnrichedFormData';
import { DynamicFormContext } from '@/modules/form/hooks/useDynamicFormContext';
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

type InitialValues = Record<string, any>;
export interface DynamicFormProps
  extends Omit<DynamicFormBaseProps, 'handlers' | 'onSaveDraft'> {
  clientId?: string;
  definition: FormDefinitionJson;
  onSubmit: (input: DynamicFormSubmitInput) => void;
  onSaveDraft?: DynamicFormOnSaveDraft;
  onDirty?: (value: boolean) => void;
  initialValues?: InitialValues;
  localConstants?: LocalConstants;
  variant?: 'standard' | 'without_top_level_cards';
}

export interface DynamicFormRef {
  SubmitForm: VoidFunction;
  SaveDraftForm: VoidFunction;
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
          onSubmit({ ...getValuesForSubmit(), confirmed: false });
        },
        SaveDraftForm: () => {
          if (props.locked) return;
          handleSaveDraft();
        },
      }),
      [onSubmit, getValuesForSubmit, props.locked, handleSaveDraft]
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

const BLANK = {};
const DynamicFormWithHandlers = forwardRef<
  DynamicFormRef,
  DynamicFormProps & { defaultValues: DefaultValues<InitialValues> }
>((props, ref) => {
  const { definition, defaultValues, localConstants = BLANK } = props;
  const handlers = useFormDefinitionHandlers({
    definition,
    defaultValues,
    localConstants,
    errors: props.errors.errors,
  });

  const {
    itemMap,
    viewOnly,
    autofillInvertedDependencyMap,
    disabledDependencyMap,
  } = handlers;
  return (
    <FormProvider {...handlers.methods}>
      <DynamicFormContext.Provider
        value={{
          definition,
          itemMap,
          localConstants,
          viewOnly,
          autofillInvertedDependencyMap,
          disabledDependencyMap,
        }}
      >
        <DynamicFormWithoutHandlers {...props} handlers={handlers} ref={ref} />
      </DynamicFormContext.Provider>
    </FormProvider>
  );
});

// load remote data (picklists) to augment form data

const DynamicFormEnrichedDataLoader = forwardRef<
  DynamicFormRef,
  DynamicFormProps
>((props, ref) => {
  const { defaultValues, loading } = useEnrichedFormData({
    pickListArgs: props.pickListArgs,
    definition: props.definition,
    initialValues: props.initialValues,
    localConstants: props.localConstants,
    viewOnly: false,
  });
  if (loading || !defaultValues) {
    return <Loading />;
  }
  return (
    <DynamicFormWithHandlers
      defaultValues={defaultValues}
      {...props}
      ref={ref}
    />
  );
});

export default DynamicFormEnrichedDataLoader;
