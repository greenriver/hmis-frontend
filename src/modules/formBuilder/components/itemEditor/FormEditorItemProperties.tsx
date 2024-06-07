import { LoadingButton } from '@mui/lab';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { startCase } from 'lodash-es';
import React, { useCallback, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { v4 } from 'uuid';
import FormEditorItemPreview from '../FormEditorItemPreview';
import AutofillProperties from './conditionals/AutofillProperties';
import ConditionalProperties from './conditionals/ConditionalProperties';
import { FormItemState } from './types';
import RhfCheckbox from '@/components/elements/input/RhfCheckbox';
import RhfSelect from '@/components/elements/input/RhfSelect';
import RhfTextInput from '@/components/elements/input/RhfTextInput';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { ErrorState } from '@/modules/errors/util';
import SaveSlide from '@/modules/form/components/SaveSlide';
import {
  MAX_INPUT_AND_LABEL_WIDTH,
  getItemMap,
  localResolvePickList,
} from '@/modules/form/util/formUtil';
import {
  slugifyItemLabel,
  validComponentsForType,
} from '@/modules/formBuilder/components/formBuilderUtil';
import {
  AssessmentRole,
  Component,
  FormDefinitionFieldsForEditorFragment,
  FormItem,
  ItemType,
} from '@/types/gqlTypes';

const dataCollectedAboutPickList =
  localResolvePickList('DataCollectedAbout') || [];
const disabledDisplayPickList = localResolvePickList('DisabledDisplay') || [];
const inputSizePickList = localResolvePickList('InputSize') || [];
const pickListTypesPickList = localResolvePickList('PickListType') || [];

interface FormEditorItemPropertiesProps {
  initialItem: FormItem;
  definition: FormDefinitionFieldsForEditorFragment;
  saveLoading: boolean;
  onSave: (item: FormItem, initialLinkId: string) => void;
  errorState?: ErrorState;
  onDiscard: () => void;
  // React Hook Form handlers
  handlers: UseFormReturn<FormItemState, any>;
}

const FormEditorItemProperties: React.FC<FormEditorItemPropertiesProps> = ({
  initialItem,
  definition,
  saveLoading,
  errorState,
  onSave,
  onDiscard,
  handlers,
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
    [dirtyFields, setValue, itemMap]
  );

  return (
    <form
      // handleSubmit validates input before calling onSubmit
      onSubmit={handleSubmit((item) =>
        // FIXME: we cast to FormItem because of DeepPartial difference. is this safe?
        onSave(item as FormItem, initialItem.linkId)
      )}
    >
      <Box sx={{ p: 2 }}>
        <Stack gap={2}>
          {itemTypeValue !== ItemType.Group && (
            <FormEditorItemPreview control={control} />
          )}
          <Divider />
        </Stack>

        <Stack
          gap={2}
          sx={{
            '.MuiFormControl-fullWidth': {
              maxWidth: MAX_INPUT_AND_LABEL_WIDTH,
            },
            mt: 2,
          }}
        >
          {/* TODO standardize heading typography, use hX */}
          <Typography>
            Properties
            {import.meta.env.MODE === 'development' && (
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
            )}
          </Typography>
          {componentOverridePicklist.length > 0 && (
            <RhfSelect
              name='component'
              control={control}
              label='Component Override'
              options={componentOverridePicklist}
            />
          )}
          <RhfTextInput
            control={control}
            name='linkId'
            helperText='Unique ID for this form item'
            label='Link ID'
            required
            // TODO: add pattern validation once it is enforced
            // rules={{
            // https://github.com/greenriver/hmis-warehouse/pull/4424
            // pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
            // }}
          />
          {itemTypeValue === ItemType.Date && isAssessment && (
            <RhfCheckbox
              name='assessmentDate'
              control={control}
              label='Assessment Date'
              helperText='If checked, this date will be recorded as the Assessment Date on the assessment'
            />
          )}
          <RhfCheckbox name='required' control={control} label='Required' />
          <RhfCheckbox
            name='warnIfEmpty'
            control={control}
            label='Warn if empty'
            helperText="If checked, user will see a warning if they don't provide an answer to this question."
          />
          <RhfTextInput
            control={control}
            name='text'
            label='Label'
            onBlur={onLabelBlur}
          />
          <RhfTextInput
            control={control}
            name='helperText'
            label='Helper Text'
          />
          <RhfTextInput
            control={control}
            name='briefText'
            label='Brief label'
            helperText="Label to display when the item is referenced briefly, such as in an Autofill dialog box. If not specified, the item's normal label text is shown."
          />
          <RhfTextInput
            control={control}
            name='readonlyText'
            label='Read-only label'
            helperText="Label to display when the item is shown in a read-only form. If not specified, the item's normal label text is shown."
          />
          <RhfCheckbox name='readOnly' control={control} label='Read-only' />
          <RhfCheckbox name='hidden' control={control} label='Hidden' />
          <RhfTextInput
            control={control}
            // TODO(#5776)
            name='mapping.customFieldKey'
            label='Mapping for custom field key'
          />
          {isAssessment && (
            <RhfSelect
              name='dataCollectedAbout'
              control={control}
              label='Data collected about'
              options={dataCollectedAboutPickList}
            />
          )}
          <RhfSelect
            name='size'
            control={control}
            label='Input Size'
            options={inputSizePickList}
          />
          <RhfSelect
            name='disabledDisplay'
            control={control}
            label='Disabled Display'
            options={disabledDisplayPickList}
          />
          {([ItemType.Choice, ItemType.OpenChoice].includes(itemTypeValue) ||
            (itemTypeValue === ItemType.Object &&
              itemComponentValue === Component.Address)) && (
            <RhfCheckbox
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
              <RhfSelect
                name='pickListReference'
                control={control}
                label='Reference list for allowed responses'
                options={pickListTypesPickList}
              />
            </>
          )}
          <Divider />
          <ConditionalProperties
            control={control}
            itemMap={getItemMap(definition.definition)}
          />
          <Divider />
          <AutofillProperties
            control={control}
            itemMap={getItemMap(definition.definition)}
            itemType={itemTypeValue}
          />
          {errorState?.errors && errorState.errors.length > 0 && (
            <Stack gap={1} sx={{ mt: 4 }}>
              <ErrorAlert key='errors' errors={errorState.errors} />
            </Stack>
          )}
        </Stack>
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
