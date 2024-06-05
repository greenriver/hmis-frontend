import { LoadingButton } from '@mui/lab';
import { Button, Divider, Stack, Typography } from '@mui/material';
import { startCase } from 'lodash-es';
import { useMemo, useState } from 'react';
import {
  Controller,
  DeepPartial,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import FormEditorItemPreview from './FormEditorItemPreview';
import SelectOption from './SelectOption';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import TextInput from '@/components/elements/input/TextInput';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { ErrorState } from '@/modules/errors/util';
import {
  MAX_INPUT_AND_LABEL_WIDTH,
  localResolvePickList,
} from '@/modules/form/util/formUtil';
import { validComponentsForType } from '@/modules/formBuilder/components/formBuilderUtil';
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
}

type FormStateType = DeepPartial<FormItem>;

const FormEditorItemProperties: React.FC<FormEditorItemPropertiesProps> = ({
  initialItem,
  definition,
  saveLoading,
  errorState,
  onSave,
  onDiscard,
}) => {
  const onSubmit: SubmitHandler<FormStateType> = (item) =>
    // casting because of DeepPartial. better way?
    onSave(item as FormItem, initialItem.linkId);

  // item type cant change (for now?)
  const [itemTypeValue] = useState<ItemType>(initialItem.type);

  const {
    control,
    getValues,
    // TODO: show root errors
    // formState: { errors },
    handleSubmit,
    watch,
  } = useForm<FormStateType>({
    values: initialItem,
    defaultValues: {
      type: ItemType.String,
    },
  });

  // Monitor changes to the FormItem.component field
  const itemComponentValue = watch('component');

  const isAssessment = useMemo(
    () => (Object.values(AssessmentRole) as [string]).includes(definition.role),
    [definition.role]
  );

  const componentOverridePicklist = useMemo(() => {
    return validComponentsForType(itemTypeValue).map((component) => {
      return {
        code: component,
        label: startCase(component.toLowerCase()),
      };
    });
  }, [itemTypeValue]);

  return (
    // handleSubmit validates input before calling onSubmit
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={2}>
        {itemTypeValue !== ItemType.Group && (
          <FormEditorItemPreview control={control} />
        )}
        <Divider />
      </Stack>

      <Stack gap={2} sx={{ maxWidth: MAX_INPUT_AND_LABEL_WIDTH, mt: 2 }}>
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
          <Controller
            name='component'
            control={control}
            // rules={{ required: 'need this' }}
            render={({ field: { ref, ...field }, fieldState: { error } }) => (
              <SelectOption
                label='Component Override'
                options={componentOverridePicklist}
                {...field}
                textInputProps={{
                  helperText: error?.message,
                  error: !!error,
                  inputRef: ref,
                }}
              />
            )}
          />
        )}
        <Controller
          name='linkId'
          control={control}
          rules={{
            required: 'Link ID is required',
            // TODO: add pattern validation once it is enforced
            // https://github.com/greenriver/hmis-warehouse/pull/4424
            // pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
          }}
          render={({ field: { ref, ...field }, fieldState: { error } }) => {
            return (
              <TextInput
                label='Link ID'
                helperText={error?.message || 'Unique ID for this form item'}
                inputRef={ref}
                {...field}
                error={!!error}
              />
            );
          }}
        />

        {itemTypeValue === ItemType.Date && isAssessment && (
          <Controller
            name='assessmentDate'
            control={control}
            render={({ field: { ref, ...field } }) => (
              <LabeledCheckbox
                label='Assessment Date'
                helperText='If checked, this date will be recorded as the Assessment Date on the assessment'
                inputRef={ref}
                {...field}
              />
            )}
          />
        )}
        <Controller
          name='required'
          control={control}
          render={({ field: { ref, ...field } }) => (
            <LabeledCheckbox label='Required' inputRef={ref} {...field} />
          )}
        />
        <Controller
          name='warnIfEmpty'
          control={control}
          render={({ field: { ref, ...field } }) => (
            <LabeledCheckbox
              label='Warn if empty'
              helperText="If checked, user will see a warning if they don't provide an answer to this question."
              inputRef={ref}
              {...field}
            />
          )}
        />
        <Controller
          name='text'
          control={control}
          render={({ field: { ref, ...field } }) => (
            <TextInput label='Label' inputRef={ref} {...field} />
          )}
        />
        <Controller
          name='helperText'
          control={control}
          render={({ field: { ref, ...field } }) => (
            <TextInput label='Helper Text' inputRef={ref} {...field} />
          )}
        />
        <Controller
          name='briefText'
          control={control}
          render={({ field: { ref, ...field } }) => (
            <TextInput
              label='Brief label'
              helperText="Label to display when the item is referenced briefly, such as in an Autofill dialog box. If not specified, the item's normal label text is shown."
              inputRef={ref}
              {...field}
            />
          )}
        />
        <Controller
          name='readonlyText'
          control={control}
          render={({ field: { ref, ...field } }) => (
            <TextInput
              label='Read-only label'
              helperText="Label to display when the item is shown in a read-only form. If not specified, the item's normal label text is shown."
              inputRef={ref}
              {...field}
            />
          )}
        />
        <Controller
          name='readOnly'
          control={control}
          render={({ field: { ref, ...field } }) => (
            <LabeledCheckbox label='Read-only' inputRef={ref} {...field} />
          )}
        />
        <Controller
          name='hidden'
          control={control}
          render={({ field: { ref, ...field } }) => (
            <LabeledCheckbox label='Hidden' inputRef={ref} {...field} />
          )}
        />
        <Controller
          name='mapping.customFieldKey'
          control={control}
          render={({ field: { ref, ...field }, fieldState: { error } }) => (
            <TextInput
              // TODO(#5776)
              label='Mapping for custom field key'
              inputRef={ref}
              error={!!error}
              helperText={error?.message}
              {...field}
            />
          )}
        />
        {isAssessment && (
          <Controller
            name='dataCollectedAbout'
            control={control}
            render={({ field: { ref, ...field }, fieldState: { error } }) => (
              <SelectOption
                label='Data collected about'
                options={dataCollectedAboutPickList}
                {...field}
                textInputProps={{
                  helperText: error?.message,
                  error: !!error,
                  inputRef: ref,
                }}
              />
            )}
          />
        )}
        <Controller
          name='size'
          control={control}
          render={({ field: { ref, ...field }, fieldState: { error } }) => (
            <SelectOption
              label='Input Size'
              options={inputSizePickList}
              {...field}
              textInputProps={{
                helperText: error?.message,
                error: !!error,
                inputRef: ref,
              }}
            />
          )}
        />
        <Controller
          name='disabledDisplay'
          control={control}
          render={({ field: { ref, ...field }, fieldState: { error } }) => (
            <SelectOption
              label='Disabled Display'
              options={disabledDisplayPickList}
              {...field}
              textInputProps={{
                helperText: error?.message,
                error: !!error,
                inputRef: ref,
              }}
            />
          )}
        />
        {([ItemType.Choice, ItemType.OpenChoice].includes(itemTypeValue) ||
          (itemTypeValue === ItemType.Object &&
            itemComponentValue === Component.Address)) && (
          <Controller
            name='repeats'
            control={control}
            render={({ field: { ref, ...field } }) => (
              <LabeledCheckbox
                label='Allow multiple responses'
                inputRef={ref}
                {...field}
              />
            )}
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
            <Controller
              name='pickListReference'
              control={control}
              render={({ field: { ref, ...field }, fieldState: { error } }) => (
                <SelectOption
                  label='Reference list for allowed responses'
                  options={pickListTypesPickList}
                  {...field}
                  textInputProps={{
                    helperText: error?.message,
                    error: !!error,
                    inputRef: ref,
                  }}
                />
              )}
            />
          </>
        )}
        {errorState?.errors && errorState.errors.length > 0 && (
          <Stack gap={1} sx={{ mt: 4 }}>
            <ErrorAlert key='errors' errors={errorState.errors} />
          </Stack>
        )}
      </Stack>
      {/* TODO use SaveSlide? */}
      <Divider sx={{ mt: 4, mb: 2 }} />
      <Stack direction='row' gap={2}>
        <Button variant='gray' onClick={onDiscard}>
          Cancel
        </Button>
        <LoadingButton type='submit' variant='contained' loading={saveLoading}>
          Save
        </LoadingButton>
      </Stack>
    </form>
  );
};

export default FormEditorItemProperties;
