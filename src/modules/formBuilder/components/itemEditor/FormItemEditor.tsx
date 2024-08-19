import { LoadingButton } from '@mui/lab';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { isNil, omitBy, startCase } from 'lodash-es';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { DeepPartial, useForm } from 'react-hook-form';
import { v4 } from 'uuid';
import FormEditorItemPreview from '../FormEditorItemPreview';
import AutofillProperties from './conditionals/AutofillProperties';
import InitialValue from './conditionals/InitialValue';
import ManageEnableWhen from './conditionals/ManageEnableWhen';
import ValueBounds from './conditionals/ValueBounds';
import RequiredOptionalRadio from './RequiredOptionalRadio';
import Section from './Section';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import { scrollToElement } from '@/hooks/useScrollToHash';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { hasErrors } from '@/modules/errors/util';
import ControlledCheckbox from '@/modules/form/components/rhf/ControlledCheckbox';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import SaveSlide from '@/modules/form/components/SaveSlide';
import {
  getItemMap,
  localResolvePickList,
  MAX_INPUT_AND_LABEL_WIDTH,
} from '@/modules/form/util/formUtil';
import ManagePickListOptions from '@/modules/formBuilder/components/itemEditor/pickLists/ManagePickListOptions';
import { useUpdateForm } from '@/modules/formBuilder/components/useUpdateForm';
import {
  BOUNDABLE_ITEM_TYPES,
  determineAutofillField,
  displayLabelForItem,
  getItemCategory,
  ItemCategory,
  slugifyItemLabel,
  updateFormItem,
  validComponentsForType,
} from '@/modules/formBuilder/formBuilderUtil';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { HmisEnums } from '@/types/gqlEnums';
import {
  AssessmentRole,
  Component,
  FormDefinitionFieldsForEditorFragment,
  FormDefinitionJson,
  FormItem,
  ItemType,
} from '@/types/gqlTypes';

const dataCollectedAboutPickList =
  localResolvePickList('DataCollectedAbout') || [];
const disabledDisplayPickList = Object.keys(HmisEnums.DisabledDisplay).map(
  (key) => ({ code: key, label: startCase(key.toLowerCase()) })
);

const inputSizePickList = Object.keys(HmisEnums.InputSize).map((key) => ({
  code: key,
  label: startCase(key.toLowerCase()),
}));
const errorAlertId = 'formItemPropertyErrors';

const textLabel = (category: ItemCategory) => {
  switch (category) {
    case 'question':
      return 'Label';
    case 'display':
      return 'Display Text';
    case 'group':
      return 'Group Label';
  }
};

interface Props {
  initialItem: FormItem;
  definition: FormDefinitionFieldsForEditorFragment;
  onSuccess: (updatedForm: FormDefinitionJson) => void;
  onDiscard: () => void;
  setDirty: Dispatch<SetStateAction<boolean>>;
}

const FormItemEditor: React.FC<Props> = ({
  initialItem,
  definition,
  onDiscard,
  onSuccess,
  setDirty,
}) => {
  // React Hook Form handlers
  const {
    control,
    getValues,
    setValue,
    handleSubmit,
    watch,
    // TODO: disable interaction with form while formState.isSubmitting
    // TODO: show formState.errors (they show up in fields if configured correctly, but we should also show them at the top)
    formState: { isDirty, dirtyFields },
  } = useForm<DeepPartial<FormItem>>({
    defaultValues: initialItem,
    // TODO: can transform server errors into RHF FieldErrors so they get inlined into the form
    // https://react-hook-form.com/ts#FieldErrors
    // errors: errorState?.errors,
  });

  // Notify parent (drawer) when form state is dirty
  useEffect(() => {
    setDirty(isDirty);
  }, [setDirty, isDirty]);

  const {
    updateForm,
    loading: saveLoading,
    errorState,
  } = useUpdateForm({ formId: definition.id, onSuccess });

  const onSave = useCallback(
    (updatedItem: FormItem, initialLinkId: string) => {
      const newDefinition = updateFormItem(
        definition.definition,
        updatedItem,
        initialLinkId
      );

      updateForm(newDefinition);
    },
    [definition.definition, updateForm]
  );

  // If typename is not present, then this is a new item that hasn't been saved yet.
  const isNewItem = useMemo(() => !initialItem.__typename, [initialItem]);

  // Monitor changes to FormItem fields
  const itemTypeValue = watch('type');
  const itemComponentValue = watch('component');
  const hiddenValue = watch('hidden');
  const hasEnableWhen = !!watch('enableWhen.0');

  const itemCategory = useMemo<ItemCategory>(() => {
    if (!itemTypeValue) return 'question';
    return getItemCategory(itemTypeValue);
  }, [itemTypeValue]);

  const isQuestionItem = itemCategory === 'question';
  const isDisplayItem = itemCategory === 'display';
  const isGroupItem = itemCategory === 'group';

  const isAssessment = useMemo(
    () => (Object.values(AssessmentRole) as [string]).includes(definition.role),
    [definition.role]
  );

  const componentOverridePicklist = useMemo(() => {
    if (!itemTypeValue) return [];
    return validComponentsForType(itemTypeValue).map((component) => ({
      code: component,
      label: startCase(component.toLowerCase()),
    }));
  }, [itemTypeValue]);

  const itemMap = useMemo(
    () => getItemMap(definition.definition),
    [definition.definition]
  );

  // If a field is marked as "always hidden", clear the enable_when conditions
  useEffect(() => {
    if (hiddenValue) {
      setValue('enableWhen', null);
      setValue('enableBehavior', null);
      setValue('disabledDisplay', null);
    }
  }, [hiddenValue, setValue]);

  const onLabelBlur = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!isNewItem) return; // Don't modify LinkID on persisted item

      // When the user edits the label, update the link ID to be a human-readable 'slugified' version of the label.
      // But, don't make an update to the link ID if it has been manually set.
      if (!dirtyFields.linkId && event.target.value) {
        let newLinkId = slugifyItemLabel(event.target.value);

        if (Object.keys(itemMap).includes(newLinkId)) {
          // If the linkId based on the label isn't unique in the form, append a unique string
          newLinkId += '_' + v4().split('-')[0];
        }

        setValue('linkId', newLinkId);
      }
    },
    [dirtyFields, setValue, itemMap, isNewItem]
  );

  // Scroll up to Error Alert if there are validation errors from the backend
  useEffect(() => {
    const element = document.getElementById(errorAlertId);
    if (errorState && hasErrors(errorState) && element) {
      scrollToElement(element);
    }
  }, [errorState]);

  if (!itemTypeValue) throw Error('Item type must be defined');

  return (
    <>
      <Typography variant='cardTitle' component='h2' sx={{ p: 2 }}>
        <Typography variant='overline' color='links' display='block'>
          {isNewItem ? 'Add New Form item' : 'Edit Form Item'}
        </Typography>
        {isNewItem
          ? `${startCase(initialItem.type.toLowerCase())} Item`
          : displayLabelForItem(initialItem)}
      </Typography>
      <Divider />
      <form
        // handleSubmit validates input before calling onSubmit
        onSubmit={handleSubmit((item) =>
          onSave(item as FormItem, initialItem.linkId)
        )}
      >
        <Box sx={{ p: 2 }}>
          {itemTypeValue !== ItemType.Group && (
            <Section title='Preview' noDivider>
              <FormEditorItemPreview control={control} />
            </Section>
          )}
        </Box>
        <Box
          sx={{
            '.MuiFormControl-fullWidth': {
              maxWidth: MAX_INPUT_AND_LABEL_WIDTH,
            },
            px: 2,
            pb: 8,
          }}
        >
          <Section
            title='Properties'
            action={
              import.meta.env.MODE === 'development' && (
                // Temp debug button to log form state
                <Button
                  size='small'
                  variant='outlined'
                  sx={{ float: 'right', typography: 'body2' }}
                  onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/naming-convention, prefer-const
                    let { __typename, item, ...vals } = getValues();
                    vals = omitBy(vals, isNil);
                    vals = omitBy(
                      vals,
                      (v) => Array.isArray(v) && v.length === 0
                    );
                    // eslint-disable-next-line no-console
                    console.log(vals);
                  }}
                >
                  debug
                </Button>
              )
            }
          >
            {errorState && hasErrors(errorState) && (
              <Stack gap={1} id={errorAlertId}>
                <ErrorAlert key='errors' errors={errorState.errors} />
              </Stack>
            )}
            {itemTypeValue === ItemType.Date && isAssessment && (
              <ControlledCheckbox
                name='assessmentDate'
                control={control}
                label='Assessment Date'
                helperText='If checked, this date will be recorded as the Assessment Date on the assessment'
              />
            )}
            {isQuestionItem && <RequiredOptionalRadio control={control} />}
            <ControlledTextInput
              required={isQuestionItem}
              control={control}
              name='text'
              label={textLabel(itemCategory)}
              onBlur={onLabelBlur}
              // FIXME doesnt correctly support multi-line display text. Newlines need to be inserted.
              multiline={isDisplayItem}
              minRows={isDisplayItem ? 2 : undefined}
            />
            {isQuestionItem && (
              <ControlledTextInput
                control={control}
                name='helperText'
                label='Helper Text'
              />
            )}
            {isQuestionItem && (
              <ControlledTextInput
                control={control}
                name='briefText'
                label='Brief label'
                helperText="Label to display when the item is referenced briefly, such as in an Autofill dialog box. If not specified, the item's normal label text is shown."
              />
            )}
            {!isGroupItem && (
              // Read-only text use cases:
              // use-case for questions: "housing status" instead of "what is your housing status?"
              // use-case for displays: hide instructional text only relevant when performing assessment
              // use-case for groups: none, which is why its hidden
              <ControlledTextInput
                control={control}
                name='readonlyText'
                label={textLabel(itemCategory) + ' for Read-Only View'}
                helperText={`${textLabel(
                  itemCategory
                )} to display when the item is shown in read-only view. If not specified, the item's ${textLabel(
                  itemCategory
                )} is shown.`}
                // FIXME doesnt correctly support multi-line display text. Newlines need to be inserted.
                multiline={isDisplayItem}
                minRows={isDisplayItem ? 2 : undefined}
              />
            )}
            {isQuestionItem && (
              <ControlledSelect
                name='size'
                control={control}
                label='Input Size'
                placeholder='Select input size'
                options={inputSizePickList}
              />
            )}
            {([ItemType.Choice, ItemType.OpenChoice].includes(itemTypeValue) ||
              (itemTypeValue === ItemType.Object &&
                itemComponentValue === Component.Address)) && (
              <ControlledCheckbox
                name='repeats'
                label='Allow multiple responses'
                control={control}
              />
            )}
          </Section>
          {[ItemType.Choice, ItemType.OpenChoice].includes(itemTypeValue) && (
            <Section title='Choices'>
              <ManagePickListOptions control={control} />
            </Section>
          )}
          <Section title='Visibility'>
            {isAssessment && (
              <ControlledSelect
                name='dataCollectedAbout'
                control={control}
                label='Client Applicability'
                placeholder='Select client applicability'
                options={dataCollectedAboutPickList}
                helperText='Select the client(s) to which this item applies. If left blank, the item will be shown for all clients.'
              />
            )}
            <ControlledCheckbox
              name='hidden'
              control={control}
              label='Always hide this item'
              sx={{ width: 'fit-content' }}
            />
            {!hiddenValue && (
              <>
                <ManageEnableWhen control={control} itemMap={itemMap} />
                {hasEnableWhen && !(itemTypeValue === ItemType.Group) && (
                  <ControlledSelect
                    name='disabledDisplay'
                    control={control}
                    label='Disabled Display'
                    placeholder='Select disabled display'
                    options={disabledDisplayPickList}
                    helperText={
                      <>
                        <b>Hidden</b>: When this item is disabled, it will be
                        completely hidden from view.
                        <br />
                        {/* TODO: Protected is only used in a few instances (Disability and some others). Should we hide it from the UI (or hide DIsabledDisplay altogether) since it's an advanced feature? */}
                        <b>Protected</b>: When this item is disabled, it will
                        still appear but not be interactable.
                        <br />
                        <b>Protected with Value</b>: When this item is disabled,
                        it will still appear and its value will be visible but
                        not interactible. Its value will be submitted.
                      </>
                    }
                  />
                )}
              </>
            )}
          </Section>
          <RootPermissionsFilter permissions='canAdministrateConfig'>
            <Section
              title='Initial Value'
              hidden={!isQuestionItem} //schema allows initial values for display items too, but we should  get rid of that. not showing it in the ui. we can manage in json
            >
              <InitialValue control={control} itemType={itemTypeValue} />
            </Section>
          </RootPermissionsFilter>
          <Section
            title='Min/Max Bounds'
            hidden={
              // bounds are supported by numbers and dates only
              !BOUNDABLE_ITEM_TYPES.includes(itemTypeValue)
            }
          >
            <ValueBounds control={control} itemMap={itemMap} />
          </Section>
          <RootPermissionsFilter permissions='canAdministrateConfig'>
            <Section
              title='Autofill'
              hidden={!isQuestionItem || !determineAutofillField(itemTypeValue)}
            >
              <AutofillProperties
                control={control}
                itemMap={itemMap}
                itemType={itemTypeValue}
              />
            </Section>
          </RootPermissionsFilter>
          <Section title='Advanced Properties' noDivider>
            {componentOverridePicklist.length > 0 && (
              <ControlledSelect
                name='component'
                control={control}
                label='Component Override'
                placeholder='Select component'
                options={componentOverridePicklist}
              />
            )}
            {isNewItem ? (
              <ControlledTextInput
                control={control}
                name='linkId'
                helperText='Unique ID for this form item. Must start with a letter and contain only letters, numbers, and underscores.'
                label='Question ID'
                disabled={!isNewItem}
                required
                rules={{
                  pattern: {
                    value: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/,
                    message:
                      'Must start with a letter and contain only letters, numbers, and underscores.',
                  },
                }}
              />
            ) : (
              <CommonLabeledTextBlock title='Question ID'>
                {initialItem.linkId}
              </CommonLabeledTextBlock>
            )}
            {!isNewItem &&
              (initialItem.mapping?.customFieldKey ||
                initialItem.mapping?.fieldName) && (
                <CommonLabeledTextBlock title='Field Key'>
                  {initialItem.mapping?.customFieldKey ||
                    initialItem.mapping?.fieldName}
                </CommonLabeledTextBlock>
              )}
          </Section>
        </Box>
        <SaveSlide in={isDirty} direction='up' loading={saveLoading}>
          <Stack direction='row' gap={2}>
            <Button variant='gray' onClick={onDiscard}>
              Cancel
            </Button>
            <LoadingButton
              type='submit'
              variant='contained'
              loading={saveLoading}
              disabled={!isDirty}
            >
              Save
            </LoadingButton>
          </Stack>
        </SaveSlide>
      </form>
    </>
  );
};

export default FormItemEditor;
