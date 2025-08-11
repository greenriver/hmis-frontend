import { forwardRef, ReactNode, useCallback, useImperativeHandle } from 'react';

import { DefaultValues, FormProvider } from 'react-hook-form';
import useFormDefinitionHandlers, {
  FormDefinitionHandlers,
} from '../hooks/useFormDefinitionHandlers';
import { FormValues, LocalConstants } from '../types';

import DirtyObserver from './DirtyObserver';
import DynamicFormBase, { DynamicFormBaseProps } from './DynamicFormBase';
import Loading from '@/components/elements/Loading';
import { ErrorFilterFn } from '@/modules/errors/util';
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
  identifier?: string;
  onSubmit: (input: DynamicFormSubmitInput) => void;
  onSaveDraft?: DynamicFormOnSaveDraft;
  onDirty?: (value: boolean) => void;
  localConstants?: LocalConstants;
  errorFilter?: ErrorFilterFn;
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
  const {
    definition,
    identifier,
    defaultValues,
    localConstants = BLANK,
  } = props;
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
          identifier,
        }}
      >
        <DynamicFormWithoutHandlers {...props} handlers={handlers} ref={ref} />
      </DynamicFormContext.Provider>
    </FormProvider>
  );
});

// load remote data (picklists) to augment form data (initialValues => defaultValues)
const DynamicFormEnrichedDataLoader = forwardRef<
  DynamicFormRef,
  DynamicFormProps & {
    // Initial values to be used for the form. NOTE: this prop shouldn't change after the initial render. defaultValues are only calculated once.
    initialValues?: InitialValues;
    // Loading element to render while the form is initially loading (due to PickLists being fetched). Named "initial" to distinguish from existing `loading` prop which typically is used to indicate that the form is submitting.
    initialLoadingElement?: ReactNode;
  }
>(({ initialValues, initialLoadingElement, ...props }, ref) => {
  const { defaultValues, loading } = useEnrichedFormData({
    pickListArgs: props.pickListArgs,
    definition: props.definition,
    initialValues: initialValues,
    localConstants: props.localConstants,
    viewOnly: false,
  });
  if (loading || !defaultValues) {
    return initialLoadingElement || <Loading />;
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
