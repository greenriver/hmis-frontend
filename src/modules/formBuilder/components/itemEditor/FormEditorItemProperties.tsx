import { LoadingButton } from '@mui/lab';
import { Box, Button, Divider, Stack } from '@mui/material';
import { startCase } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { v4 } from 'uuid';
import FormEditorItemPreview from '../FormEditorItemPreview';
import AutofillProperties from './conditionals/AutofillProperties';
import ManageEnableWhen from './conditionals/ManageEnableWhen';
import InitialValue from './InitialValue';
import RequiredOptionalRadio from './RequiredOptionalRadio';
import Section from './Section';
import { FormItemState } from './types';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import { scrollToElement } from '@/hooks/useScrollToHash';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { ErrorState, hasErrors } from '@/modules/errors/util';
import ControlledCheckbox from '@/modules/form/components/rhf/ControlledCheckbox';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import SaveSlide from '@/modules/form/components/SaveSlide';
import {
  MAX_INPUT_AND_LABEL_WIDTH,
  getItemMap,
  localResolvePickList,
} from '@/modules/form/util/formUtil';
import {
  slugifyItemLabel,
  validComponentsForType,
} from '@/modules/formBuilder/formBuilderUtil';
import { HmisEnums } from '@/types/gqlEnums';
import {
  AssessmentRole,
  Component,
  FormDefinitionFieldsForEditorFragment,
  FormItem,
  ItemType,
} from '@/types/gqlTypes';

const dataCollectedAboutPickList =
  localResolvePickList('DataCollectedAbout') || [];
const disabledDisplayPickList = Object.keys(HmisEnums.DisabledDisplay).map(
  (key) => ({ code: key, label: startCase(key.toLowerCase()) })
);
const inputSizePickList = localResolvePickList('InputSize') || [];
const pickListTypesPickList = localResolvePickList('PickListType') || [];
const errorAlertId = 'formItemPropertyErrors';

interface FormEditorItemPropertiesProps {
  initialItem: FormItem;
  definition: FormDefinitionFieldsForEditorFragment;
  saveLoading: boolean;
  onSave: (item: FormItem, initialLinkId: string) => void;
  errorState?: ErrorState;
  onDiscard: () => void;
  // React Hook Form handlers
  handlers: UseFormReturn<FormItemState, any>;
  isNewItem?: boolean;
}

const FormEditorItemProperties: React.FC<FormEditorItemPropertiesProps> = ({
  initialItem,
  definition,
  saveLoading,
  errorState,
  onSave,
  onDiscard,
  handlers,
  isNewItem,
}) => {
  // React Hook Form handlers (useForm return object)
  const {
    control,
    getValues,
    setValue,
    handleSubmit,
    watch,
    formState: { isDirty, dirtyFields },
  } = handlers;

  // Item type is not allowed to change in this form
  const [itemTypeValue] = useState<ItemType>(initialItem.type);

  // Monitor changes to the FormItem.component field
  const itemComponentValue = watch('component');

  const isQuestionItem = ![ItemType.Group, ItemType.Display].includes(
    itemTypeValue
  );
  const isDisplayItem = itemTypeValue === ItemType.Display;

  const isAssessment = useMemo(
    () => (Object.values(AssessmentRole) as [string]).includes(definition.role),
    [definition.role]
  );

  const componentOverridePicklist = useMemo(() => {
    return validComponentsForType(itemTypeValue).map((component) => ({
      code: component,
      label: startCase(component.toLowerCase()),
    }));
  }, [itemTypeValue]);

  const itemMap = useMemo(
    () => getItemMap(definition.definition),
    [definition.definition]
  );

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

  return (
    <form
      // handleSubmit validates input before calling onSubmit
      onSubmit={handleSubmit((item) =>
        onSave(item as FormItem, initialItem.linkId)
      )}
    >
      <Box sx={{ p: 2 }}>
        {itemTypeValue !== ItemType.Group && (
          <Section title='Preview'>
            <FormEditorItemPreview control={control} />
          </Section>
        )}
        <Section
          title='Properties'
          sx={{
            '.MuiFormControl-fullWidth': {
              maxWidth: MAX_INPUT_AND_LABEL_WIDTH,
            },
            mt: 2,
          }}
          action={
            import.meta.env.MODE === 'development' && (
              // Temp debug button to log form state
              <Button
                size='small'
                variant='outlined'
                sx={{ float: 'right', typography: 'body2' }}
                // eslint-disable-next-line no-console
                onClick={() => console.log(getValues())}
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
          {componentOverridePicklist.length > 0 && (
            <ControlledSelect
              name='component'
              control={control}
              label='Component Override'
              placeholder='Select component'
              options={componentOverridePicklist}
            />
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
            label={isDisplayItem ? 'Display Text' : 'Label'}
            onBlur={onLabelBlur}
            // FIXME doesnt correctly support multi-line display text. Newlines need to be inserted.
            multiline={isDisplayItem}
            minRows={isDisplayItem ? 2 : undefined}
          />
          <ControlledTextInput
            control={control}
            name='helperText'
            label='Helper Text'
          />
          <ControlledTextInput
            control={control}
            name='briefText'
            label='Brief label'
            helperText="Label to display when the item is referenced briefly, such as in an Autofill dialog box. If not specified, the item's normal label text is shown."
          />
          <ControlledTextInput
            control={control}
            name='readonlyText'
            label='Read-only label'
            helperText="Label to display when the item is shown in a read-only form. If not specified, the item's normal label text is shown."
          />
          <ControlledSelect
            name='size'
            control={control}
            label='Input Size'
            placeholder='Select input size'
            options={inputSizePickList}
          />
          {([ItemType.Choice, ItemType.OpenChoice].includes(itemTypeValue) ||
            (itemTypeValue === ItemType.Object &&
              itemComponentValue === Component.Address)) && (
            <ControlledCheckbox
              name='repeats'
              label='Allow multiple responses'
              control={control}
            />
          )}
          {[ItemType.Choice, ItemType.OpenChoice].includes(itemTypeValue) && (
            <>
              {/* <TextInput
              label='Allowed Responses'
              value={item.pickListOptions?.map((o) => o.code).join(',')}
              onChange={(e) => {
                onChangeProperty(
                  'pickListOptions',
                  e.target.value.split(',').map((o) => {
                    return { code: o };
                  })
                );
              }}
            />
             */}
              <ControlledSelect
                name='pickListReference'
                control={control}
                label='Reference list for allowed responses'
                placeholder='Select pick list'
                options={pickListTypesPickList}
              />
            </>
          )}
          <Divider />
          <Section title='Advanced Properties'>
            {isNewItem ? (
              <ControlledTextInput
                control={control}
                name='linkId'
                helperText='Unique ID for this form item'
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
            <ControlledTextInput
              control={control}
              // TODO(#5776)
              name='mapping.customFieldKey'
              label='Mapping for custom field key'
            />
          </Section>
          <Divider />
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
              label='Always Hide this Item'
            />
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
                  {/* TODO: do we actually use  'protected' at all? can we remove it? */}
                  <b>Protected</b>: When this item is disabled, it will still
                  show up but not be interactable.
                  <br />
                  <b>Protected with Value</b>: When this item is disabled, it
                  will still appear and its value will be visible but not
                  interactible. It's value will be submitted.
                </>
              }
            />
            <ManageEnableWhen control={control} itemMap={itemMap} />
          </Section>
          <Divider />
          <Section title='Initial Value'>
            <InitialValue control={control} itemType={itemTypeValue} />
          </Section>
          <Divider />
          <Section title='Autofill'>
            {/* initial value 
            
            'initial.0'
            initialBehavior
            value_local_constant
            value_code
            value_number
            value_boolean
            */}
            <AutofillProperties
              control={control}
              itemMap={itemMap}
              itemType={itemTypeValue}
            />
          </Section>
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
  );
};

export default FormEditorItemProperties;
