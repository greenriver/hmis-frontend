import { Typography } from '@mui/material';
import { isNil } from 'lodash-es';
import React, { useCallback } from 'react';

import { getValueFromPickListData, usePickList } from '../hooks/usePickList';
import {
  ChangeType,
  DynamicFieldProps,
  DynamicInputCommonProps,
} from '../types';
import {
  chooseSelectComponentType,
  hasMeaningfulValue,
  isDataNotCollected,
  maxWidthAtNestingLevel,
  placeholderText,
} from '../util/formUtil';

import MultiAddressInput from './client/addresses/MultiAddressInput';
import MultiEmailInput from './client/emails/MultiEmailInput';
import MultiNameInput from './client/names/MultiNameInput';
import MultiPhoneInput from './client/phones/MultiPhoneInput';
import CreatableFormSelect from './CreatableFormSelect';
import DynamicDisplay from './DynamicDisplay';
import FormSelect from './FormSelect';
import InputContainer from './InputContainer';
import RequiredLabel from './RequiredLabel';

import CheckboxGroupInput from '@/components/elements/input/CheckboxGroupInput';
import DatePicker from '@/components/elements/input/DatePicker';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import NoYesMissingCheckbox from '@/components/elements/input/NoYesMissingCheckbox';
import NumberInput from '@/components/elements/input/NumberInput';
import PhoneInput from '@/components/elements/input/PhoneInput';
import RadioGroupInput from '@/components/elements/input/RadioGroupInput';
import SsnInput from '@/components/elements/input/SsnInput';
import TextInput from '@/components/elements/input/TextInput';
import TimeOfDayPicker from '@/components/elements/input/TimeOfDayPicker';
import YesNoRadio from '@/components/elements/input/YesNoRadio';
import Uploader from '@/components/elements/upload/UploaderBase';
import MciClearance from '@/modules/external/mci/components/MciClearance';
import SimpleAddressInput from '@/modules/form/components/client/addresses/SimpleAddressInput';
import { INVALID_ENUM, parseHmisDateString } from '@/modules/hmis/hmisUtil';
import { Component, FormItem, InputSize, ItemType } from '@/types/gqlTypes';

const getLabel = (item: FormItem, horizontal?: boolean) => {
  if (!item.text) return null;

  return (
    <RequiredLabel
      text={item.text}
      required={item.required}
      TypographyProps={{
        fontWeight:
          item.component === Component.Checkbox || horizontal ? undefined : 600,
      }}
    />
  );
};

const MAX_INPUT_AND_LABEL_WIDTH = 600; // allow label to extend past input before wrapping
export const MAX_INPUT_WIDTH = 500;
const FIXED_WIDTH_MEDIUM = 350;
const FIXED_WIDTH_SMALL = 200;
const FIXED_WIDTH_X_SMALL = 100;

const minWidthForType = (item: FormItem) => {
  if (item.component || item.size) return undefined;

  switch (item.type) {
    case ItemType.String:
    case ItemType.Text:
      return 300;
    case ItemType.Choice:
    case ItemType.OpenChoice:
      return FIXED_WIDTH_MEDIUM;
    default:
      return undefined;
  }
};

const DynamicField: React.FC<DynamicFieldProps> = ({
  item,
  itemChanged,
  nestingLevel = 0,
  value,
  disabled = false,
  horizontal = false,
  errors,
  inputProps,
  pickListArgs,
  noLabel = false,
  warnIfEmpty = false,
  breakpoints,
}) => {
  const { linkId } = item;
  const onChangeEvent = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      itemChanged({ linkId, value: e.target.value, type: ChangeType.User }),
    [linkId, itemChanged]
  );
  const onChangeValue = useCallback(
    (value: any) => itemChanged({ linkId, value, type: ChangeType.User }),
    [linkId, itemChanged]
  );
  const onChangeEventValue = useCallback(
    (_: any, value: any) =>
      itemChanged({ linkId, value, type: ChangeType.User }),
    [linkId, itemChanged]
  );

  const label = noLabel ? null : getLabel(item, horizontal);
  let maxWidth = maxWidthAtNestingLevel(nestingLevel);
  const minWidth = minWidthForType(item);
  let width;

  if (
    item.size === InputSize.Small ||
    item.type === ItemType.Date ||
    item.type === ItemType.TimeOfDay
  ) {
    width = FIXED_WIDTH_SMALL;
  } else if (item.size === InputSize.Xsmall) {
    width = FIXED_WIDTH_X_SMALL;
  } else if (item.size === InputSize.Medium) {
    width = FIXED_WIDTH_MEDIUM;
  }

  if (item.component === Component.RadioButtons) {
    maxWidth = 600;
  }

  const commonContainerProps = { errors, horizontal, breakpoints };

  const isInvalidEnumValue =
    value === INVALID_ENUM || value?.code === INVALID_ENUM;

  const commonInputProps: DynamicInputCommonProps = {
    label,
    error: !!(errors && errors.length > 0) || isInvalidEnumValue,
    helperText: item.helperText,
    id: linkId,
    ...inputProps,
    disabled: disabled || inputProps?.disabled,
  };
  commonInputProps.warnIfEmptyTreatment =
    warnIfEmpty &&
    (!!item.warnIfEmpty || !!item.required) &&
    !commonInputProps.disabled &&
    !commonInputProps.error &&
    (!hasMeaningfulValue(value) || isDataNotCollected(value));

  const {
    pickList: options,
    loading: pickListLoading,
    isLocalPickList,
  } = usePickList({
    item,
    ...pickListArgs,
    fetchOptions: {
      onCompleted: (data) => {
        const newValue = getValueFromPickListData({
          item,
          value,
          linkId: item.linkId,
          data,
        });
        // If this is already cached this will call setState within a render, which is an error; So use timeout to push the setter call to the next render cycle
        if (newValue) setTimeout(() => itemChanged(newValue));
      },
    },
  });

  const placeholder = placeholderText(item);

  if (item.component === Component.Mci) {
    return (
      <MciClearance
        value={value}
        onChange={onChangeValue}
        {...commonInputProps}
        disabled={false}
      />
    );
  }
  switch (item.type) {
    case ItemType.Display:
      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          <DynamicDisplay maxWidth={maxWidth + 100} item={item} value={value} />
        </InputContainer>
      );
    case ItemType.Boolean:
      if (item.component === Component.Checkbox) {
        return (
          <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
            <LabeledCheckbox
              checked={!!value}
              onChange={(e) =>
                itemChanged({
                  linkId,
                  value: (e.target as HTMLInputElement).checked,
                  type: ChangeType.User,
                })
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
              id={linkId}
              name={linkId}
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

      if (item.component === Component.Phone) {
        return (
          <PhoneInput
            id={linkId}
            value={value || ''}
            onChange={onChangeEvent}
            sx={{
              width,
              maxWidth: MAX_INPUT_AND_LABEL_WIDTH,
              '.MuiInputBase-root': { maxWidth: MAX_INPUT_WIDTH },
            }}
            {...commonInputProps}
          />
        );
      }

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
              id: linkId,
              horizontal,
              sx: { width },
            }}
            {...datePickerProps}
            {...commonInputProps}
          />
        </InputContainer>
      );
    case ItemType.TimeOfDay:
      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          <TimeOfDayPicker
            value={value}
            onChange={onChangeValue}
            textInputProps={{
              id: linkId,
              horizontal,
              sx: { width },
            }}
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
      const currentValue = value ? value : item.repeats ? [] : null;

      const componentType = chooseSelectComponentType(
        item,
        options?.length || 0,
        isLocalPickList
      );

      let inputComponent;
      if (
        componentType === Component.Checkbox &&
        item.pickListReference === 'NoYesMissing'
      ) {
        inputComponent = (
          <NoYesMissingCheckbox
            value={currentValue}
            onChange={onChangeValue}
            horizontal={horizontal}
            {...commonInputProps}
          />
        );
      } else if (
        componentType === Component.RadioButtons ||
        componentType === Component.RadioButtonsVertical
      ) {
        inputComponent = item.repeats ? (
          <CheckboxGroupInput
            value={currentValue}
            onChange={onChangeValue}
            options={options || []}
            row={componentType === Component.RadioButtons}
            {...commonInputProps}
          />
        ) : (
          <RadioGroupInput
            value={currentValue}
            onChange={onChangeValue}
            options={options || []}
            row={componentType === Component.RadioButtons}
            clearable
            {...commonInputProps}
          />
        );
      } else {
        inputComponent = (
          <FormSelect
            value={currentValue}
            options={options || []}
            onChange={onChangeEventValue}
            multiple={!!item.repeats}
            loading={pickListLoading}
            placeholder={placeholder}
            textInputProps={{
              name: linkId,
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
            id={linkId}
            image
            onUpload={async (upload) => onChangeValue(upload.blobId)}
          />
        </InputContainer>
      );
    case ItemType.File:
      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          <Uploader
            id={linkId}
            onUpload={async (upload) => onChangeValue(upload.blobId)}
          />
        </InputContainer>
      );
    case ItemType.Object:
      const objProps = {
        value,
        onChange: onChangeValue,
        label: item.text ? (
          <Typography variant='h4' sx={{ pb: 2, fontSize: 18 }}>
            {item.text}
          </Typography>
        ) : undefined,
      };
      if (item.component === Component.Name) {
        return <MultiNameInput {...objProps} />;
      }
      if (item.component === Component.Address) {
        return item.repeats ? (
          <MultiAddressInput {...objProps} />
        ) : (
          <SimpleAddressInput {...objProps} />
        );
      }
      if (item.component === Component.Phone) {
        return <MultiPhoneInput {...objProps} />;
      }
      if (item.component === Component.Email) {
        return <MultiEmailInput {...objProps} />;
      }
      console.warn(
        'Unable to render component for object type. Link ID:',
        item.linkId
      );
      return <></>;

    default:
      console.warn('Unrecognized item type:', item.type);
      return <></>;
  }
};

export default DynamicField;
