import { Stack, Typography } from '@mui/material';
import { isNil } from 'lodash-es';
import React, { ReactNode } from 'react';

import { usePickList } from '../hooks/usePickList';
import { hasMeaningfulValue, isPickListOption } from '../util/formUtil';

import CreatableFormSelect from './CreatableFormSelect';
import DynamicDisplay from './DynamicDisplay';
import FormSelect from './FormSelect';
import InputContainer from './InputContainer';

import DatePicker from '@/components/elements/input/DatePicker';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import NumberInput from '@/components/elements/input/NumberInput';
import OrganizationSelect from '@/components/elements/input/OrganizationSelect';
import ProjectSelect from '@/components/elements/input/ProjectSelect';
import RadioGroupInput from '@/components/elements/input/RadioGroupInput';
import SsnInput from '@/components/elements/input/SsnInput';
import TextInput from '@/components/elements/input/TextInput';
import YesNoRadio from '@/components/elements/input/YesNoRadio';
import Uploader from '@/components/elements/upload/UploaderBase';
import { INVALID_ENUM, parseHmisDateString } from '@/modules/hmis/hmisUtil';
import {
  Component,
  FormItem,
  InputSize,
  ItemType,
  ValidationError,
} from '@/types/gqlTypes';

export interface DynamicInputCommonProps {
  id?: string;
  disabled?: boolean;
  label?: ReactNode;
  error?: boolean;
  warnIfEmptyTreatment?: boolean;
  helperText?: ReactNode;
  min?: any;
  max?: any;
  placeholder?: string;
}

export interface DynamicFieldProps {
  item: FormItem;
  itemChanged: (linkId: string, value: any) => void;
  nestingLevel: number;
  value: any;
  disabled?: boolean;
  errors?: ValidationError[];
  inputProps?: DynamicInputCommonProps;
  horizontal?: boolean;
  pickListRelationId?: string;
  noLabel?: boolean;
  warnIfEmpty?: boolean;
}

const getLabel = (item: FormItem, horizontal?: boolean) => {
  if (!item.prefix && !item.text) return null;

  return (
    <Stack direction='row' spacing={1}>
      <Typography
        variant='body2'
        fontWeight={
          item.component === Component.Checkbox || horizontal ? undefined : 600
        }
      >
        {item.text}
      </Typography>
      {item.required && (
        <Typography variant='body2' color='error'>
          (Required)
        </Typography>
      )}
    </Stack>
  );
};

const MAX_INPUT_AND_LABEL_WIDTH = 600; // allow label to extend past input before wrapping
const MAX_INPUT_WIDTH = 380;
const FIXED_WIDTH_SMALL = 200;
const FIXED_WIDTH_X_SMALL = 100;

export const maxWidthAtNestingLevel = (nestingLevel: number) =>
  600 - nestingLevel * 26;

const DynamicField: React.FC<DynamicFieldProps> = ({
  item,
  itemChanged,
  nestingLevel,
  value,
  disabled = false,
  horizontal = false,
  errors,
  inputProps,
  pickListRelationId,
  noLabel = false,
  warnIfEmpty = false,
}) => {
  const onChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) =>
    itemChanged(item.linkId, e.target.value);
  const onChangeValue = (val: any) => itemChanged(item.linkId, val);
  const onChangeEventValue = (_: any, val: any) =>
    itemChanged(item.linkId, val);
  const label = noLabel ? null : getLabel(item, horizontal);
  let maxWidth = maxWidthAtNestingLevel(nestingLevel);
  const minWidth = undefined;
  let width;

  if (item.size === InputSize.Small || item.type === ItemType.Date) {
    width = FIXED_WIDTH_SMALL;
  } else if (item.size === InputSize.Xsmall) {
    width = FIXED_WIDTH_X_SMALL;
  }

  if (item.component === Component.RadioButtons) {
    maxWidth = 600;
  }

  const commonContainerProps = { errors, horizontal };

  const isInvalidEnumValue =
    value === INVALID_ENUM || value?.code === INVALID_ENUM;

  const commonInputProps: DynamicInputCommonProps = {
    disabled,
    label,
    error: !!(errors && errors.length > 0) || isInvalidEnumValue,
    helperText: item.helperText,
    id: item.linkId,
    warnIfEmptyTreatment:
      warnIfEmpty &&
      !!item.warnIfEmpty &&
      !disabled &&
      !hasMeaningfulValue(value),
    ...inputProps,
  };

  const [options, pickListLoading, isLocalPickList] = usePickList(
    item,
    pickListRelationId,
    {
      fetchPolicy: 'network-only', // Always fetch, because ProjectCoC records may have changed
      onCompleted: (data) => {
        if (!data?.pickList) return;

        if (value) {
          const fullOption = data.pickList.find((o) => o.code === value.code);
          if (fullOption) {
            // Update the value so that it shows the complete label
            itemChanged(item.linkId, fullOption);
          } else {
            console.warn(
              `Selected value '${value.code}' is not present in option list '${item.pickListReference}'`
            );
          }
        } else {
          // Set initial value if applicable
          const initial = data.pickList.find((o) => o.initialSelected);
          if (initial) itemChanged(item.linkId, initial);
        }
      },
    }
  );

  const placeholder =
    item.size === InputSize.Xsmall
      ? undefined
      : `Select ${item.briefText || item.text || ''}...`;

  switch (item.type) {
    case ItemType.Display:
      return <DynamicDisplay maxWidth={maxWidth + 100} item={item} />;
    case ItemType.Boolean:
      if (item.component === Component.Checkbox) {
        return (
          <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
            <LabeledCheckbox
              checked={!!value}
              onChange={(e) =>
                itemChanged(item.linkId, (e.target as HTMLInputElement).checked)
              }
              horizontal={horizontal}
              {...commonInputProps}
            />
          </InputContainer>
        );
      }
      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          <YesNoRadio
            value={value}
            onChange={onChangeValue}
            {...commonInputProps}
          />
        </InputContainer>
      );
    case ItemType.String:
    case ItemType.Text:
      if (item.component === Component.Ssn)
        return (
          <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
            <SsnInput
              id={item.linkId}
              name={item.linkId}
              value={value || ''}
              onChange={onChangeValue}
              sx={{
                width,
                maxWidth: MAX_INPUT_AND_LABEL_WIDTH,
                '.MuiInputBase-root': { maxWidth: MAX_INPUT_WIDTH },
              }}
              {...commonInputProps}
            />
          </InputContainer>
        );

      const multiline = item.type === ItemType.Text;
      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          <TextInput
            value={value || ''}
            onChange={onChangeEvent}
            multiline={multiline}
            minRows={multiline ? 2 : undefined}
            horizontal={horizontal}
            sx={{
              width,
              maxWidth: MAX_INPUT_AND_LABEL_WIDTH,
              '.MuiInputBase-root': { maxWidth: MAX_INPUT_WIDTH },
            }}
            {...commonInputProps}
          />
        </InputContainer>
      );
    case ItemType.Integer:
    case ItemType.Currency:
      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          <NumberInput
            value={isNil(value) ? '' : value}
            onChange={onChangeEvent}
            horizontal={horizontal}
            currency={item.type === ItemType.Currency}
            inputWidth={width}
            disableArrowKeys={item.type === ItemType.Currency}
            {...commonInputProps}
          />
        </InputContainer>
      );
    case ItemType.Date:
      const datePickerProps = {};
      const dateValue =
        value && typeof value === 'string' ? parseHmisDateString(value) : value;
      // item.type === ItemType.Dob
      //   ? { openTo: 'year' as CalendarPickerView, disableFuture: true }
      //   : {};
      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          <DatePicker
            value={dateValue || null}
            onChange={onChangeValue}
            textInputProps={{
              id: item.linkId,
              horizontal,
              sx: { width },
            }}
            {...datePickerProps}
            {...commonInputProps}
          />
        </InputContainer>
      );
    case ItemType.OpenChoice:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const selectedChoiceVal = value ? value : item.repeats ? [] : null;
      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          <CreatableFormSelect
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={selectedChoiceVal}
            options={options || []}
            onChange={onChangeEventValue}
            multiple={!!item.repeats}
            loading={pickListLoading}
            placeholder={placeholder}
            textInputProps={{
              horizontal,
              sx: {
                maxWidth: MAX_INPUT_AND_LABEL_WIDTH,
                '.MuiInputBase-root': { maxWidth: MAX_INPUT_WIDTH },
              },
            }}
            {...commonInputProps}
          />
        </InputContainer>
      );
    case ItemType.Choice:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let selectedVal = value ? value : item.repeats ? [] : null;

      // for auto-populated choice fields with remotely fetched picklists
      if (options && isPickListOption(selectedVal) && !selectedVal.label) {
        const found = options.find((o) => o.code === selectedVal.code);
        if (found) selectedVal = found;
      }

      let inputComponent;
      if (
        item.pickListReference &&
        ['projects', 'organizations'].includes(item.pickListReference)
      ) {
        const SelectComponent =
          item.pickListReference === 'projects'
            ? ProjectSelect
            : OrganizationSelect;
        inputComponent = (
          <SelectComponent
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={selectedVal}
            onChange={onChangeEventValue}
            multiple={!!item.repeats}
            disabled={disabled}
          />
        );
      } else if (
        item.component === Component.RadioButtons ||
        item.component === Component.RadioButtonsVertical ||
        (isLocalPickList && options && options.length > 0 && options.length < 4)
      ) {
        inputComponent = (
          <RadioGroupInput
            value={selectedVal}
            onChange={onChangeValue}
            options={options || []}
            row={item.component !== Component.RadioButtonsVertical}
            clearable
            checkbox
            {...commonInputProps}
          />
        );
      } else {
        inputComponent = (
          <FormSelect
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={selectedVal}
            options={options || []}
            onChange={onChangeEventValue}
            multiple={!!item.repeats}
            loading={pickListLoading}
            placeholder={placeholder}
            textInputProps={{
              name: item.linkId,
              horizontal,
              sx: {
                width,
                // cant allow label to extend, because it messes up click target for closing dropdwon
                maxWidth: MAX_INPUT_WIDTH,
                '.MuiInputBase-root': { maxWidth: MAX_INPUT_WIDTH },
              },
            }}
            sx={{ maxWidth: MAX_INPUT_WIDTH }} // for click target for closing dropdwon
            {...commonInputProps}
          />
        );
      }

      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          {inputComponent}
        </InputContainer>
      );
    case ItemType.Image:
      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          <Uploader
            onUpload={async (upload, file) => {
              console.log({ upload, file });
              onChangeValue(upload.blobId);
            }}
          />
        </InputContainer>
      );
    default:
      console.warn('Unrecognized item type:', item.type);
      return <></>;
  }
};

export default DynamicField;
