import { Typography } from '@mui/material';
import { isNil } from 'lodash-es';
import React, { useCallback } from 'react';

import { usePickList } from '../hooks/usePickList';
import {
  ChangeType,
  DynamicFieldProps,
  DynamicInputCommonProps,
} from '../types';
import {
  chooseSelectComponentType,
  FIXED_WIDTH_MEDIUM,
  FIXED_WIDTH_SMALL,
  FIXED_WIDTH_X_LARGE,
  FIXED_WIDTH_X_SMALL,
  hasMeaningfulValue,
  isDataNotCollected,
  MAX_INPUT_AND_LABEL_WIDTH,
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
import GeolocationInput from '@/components/elements/input/GeolocationInput';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import MinutesDurationInput from '@/components/elements/input/MinutesDurationInput';
import NoYesMissingCheckbox from '@/components/elements/input/NoYesMissingCheckbox';
import NumberInput from '@/components/elements/input/NumberInput';
import PhoneInput from '@/components/elements/input/PhoneInput';
import RadioGroupInput from '@/components/elements/input/RadioGroupInput';
import SsnInput from '@/components/elements/input/SsnInput';
import TextInput from '@/components/elements/input/TextInput';
import TimeOfDayPicker from '@/components/elements/input/TimeOfDayPicker';
import YesNoRadio from '@/components/elements/input/YesNoRadio';
import LabelWithContent from '@/components/elements/LabelWithContent';
import Uploader from '@/components/elements/upload/Uploader';
import useAuth from '@/modules/auth/hooks/useAuth';
import ClientCeEligibility from '@/modules/ce/components/ClientCeEligibility';
import AltAhaScore from '@/modules/external/aha/components/AltAhaScore';
import MciClearance from '@/modules/external/mci/components/MciClearance';
import SimpleAddressInput from '@/modules/form/components/client/addresses/SimpleAddressInput';
import { INVALID_ENUM, parseHmisDateString } from '@/modules/hmis/hmisUtil';
import { safeParseLatLon } from '@/types/geolocationTypes';
import {
  Component,
  DisabledDisplay,
  FormItem,
  InputSize,
  ItemType,
} from '@/types/gqlTypes';

export const getLabel = (
  item: FormItem,
  horizontal?: boolean,
  isDisabled?: boolean
) => {
  if (!item.text) return null;

  return (
    <RequiredLabel
      text={item.text}
      required={item.required && !isDisabled}
      TypographyProps={{
        fontWeight:
          item.component === Component.Checkbox || horizontal ? undefined : 600,
      }}
    />
  );
};

const DynamicField: React.FC<DynamicFieldProps> = ({
  item,
  itemChanged,
  handlers,
  value: formValue,
  disabled = false,
  horizontal = false,
  errors,
  inputProps,
  pickListArgs,
  noLabel = false,
  warnIfEmpty = false,
  breakpoints,
  localConstants,
}) => {
  const { linkId } = item;
  const value =
    disabled && item.disabledDisplay !== DisabledDisplay.ProtectedWithValue
      ? undefined
      : formValue;
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

  const { user: currentUser } = useAuth();
  const userCanEdit =
    !!currentUser?.id &&
    (!item.editorUserIds || item.editorUserIds.includes(currentUser.id));

  const isDisabled = disabled || inputProps?.disabled || !userCanEdit;
  const label = noLabel ? null : getLabel(item, horizontal, isDisabled);
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

  const commonContainerProps = { errors, horizontal, breakpoints };

  const isInvalidEnumValue =
    value === INVALID_ENUM || value?.code === INVALID_ENUM;

  const commonInputProps: DynamicInputCommonProps = {
    label,
    ariaLabel: item.text || undefined,
    error: !!(errors && errors.length > 0) || isInvalidEnumValue,
    helperText: item.helperText,
    id: linkId,
    ...inputProps,
    disabled: isDisabled,
    inputWidth: width,
    maxWidth: MAX_INPUT_AND_LABEL_WIDTH,
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
  });

  const placeholder = placeholderText(item);

  if (item.component === Component.Mci) {
    if (!handlers) throw new Error('MCI field missing required handlers');

    return (
      <MciClearance
        value={value}
        onChange={onChangeValue}
        {...commonInputProps}
        disabled={false}
        handlers={handlers}
      />
    );
  }
  switch (item.type) {
    case ItemType.Display:
      return (
        <InputContainer {...commonContainerProps}>
          <DynamicDisplay
            maxWidth={MAX_INPUT_AND_LABEL_WIDTH}
            width={width}
            item={item}
            value={value}
            localConstants={localConstants}
          />
        </InputContainer>
      );
    case ItemType.Boolean:
      if (item.component === Component.Checkbox) {
        return (
          <InputContainer {...commonContainerProps}>
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
              inputWidth={width}
              maxWidth={FIXED_WIDTH_X_LARGE}
            />
          </InputContainer>
        );
      }
      return (
        <InputContainer {...commonContainerProps}>
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
          <InputContainer {...commonContainerProps}>
            <SsnInput
              id={linkId}
              name={linkId}
              value={value || ''}
              onChange={onChangeValue}
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
            {...commonInputProps}
            inputWidth={155}
          />
        );
      }

      const multiline = item.type === ItemType.Text;
      return (
        <InputContainer {...commonContainerProps}>
          <TextInput
            value={value || ''}
            onChange={onChangeEvent}
            multiline={multiline}
            minRows={multiline ? 2 : undefined}
            horizontal={horizontal}
            {...commonInputProps}
            inputWidth={width}
          />
        </InputContainer>
      );
    case ItemType.Integer:
    case ItemType.Currency:
      if (item.component === Component.MinutesDuration)
        return (
          <InputContainer {...commonContainerProps}>
            <MinutesDurationInput
              value={isNil(value) ? '' : value}
              onChange={onChangeValue}
              {...commonInputProps}
            />
          </InputContainer>
        );
      if (item.component === Component.AltAha) {
        return (
          <InputContainer {...commonContainerProps}>
            <AltAhaScore
              value={value}
              onChange={onChangeValue}
              label={label}
              disabled={isDisabled}
              handlers={handlers}
              {...commonInputProps}
            />
          </InputContainer>
        );
      }
      return (
        <InputContainer {...commonContainerProps}>
          <NumberInput
            value={isNil(value) ? '' : value}
            onChange={onChangeEvent}
            horizontal={horizontal}
            currency={item.type === ItemType.Currency}
            {...commonInputProps}
            inputWidth={120}
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
        <InputContainer {...commonContainerProps}>
          <DatePicker
            value={dateValue || null}
            onChange={onChangeValue}
            textInputProps={{
              id: linkId,
              horizontal,
            }}
            {...datePickerProps}
            {...commonInputProps}
          />
        </InputContainer>
      );
    case ItemType.TimeOfDay:
      return (
        <InputContainer {...commonContainerProps}>
          <TimeOfDayPicker
            value={value}
            onChange={onChangeValue}
            textInputProps={{
              id: linkId,
              horizontal,
            }}
            {...commonInputProps}
          />
        </InputContainer>
      );
    case ItemType.OpenChoice:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const selectedChoiceVal = value ? value : item.repeats ? [] : null;
      return (
        <InputContainer {...commonContainerProps}>
          <CreatableFormSelect
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={selectedChoiceVal}
            options={options || []}
            onChange={onChangeEventValue}
            multiple={!!item.repeats}
            loading={pickListLoading}
            placeholder={placeholder}
            textInputProps={{ name: linkId, horizontal }}
            {...commonInputProps}
            maxWidth={MAX_INPUT_AND_LABEL_WIDTH}
            inputWidth={width}
          />
        </InputContainer>
      );
    case ItemType.Choice:
      const currentValue = value ? value : item.repeats ? [] : null;

      if (item.component === Component.ClientCeEligibility) {
        if (!handlers)
          throw new Error(
            'CE Client Eligibility field missing required handlers'
          );

        return (
          <InputContainer {...commonContainerProps}>
            <ClientCeEligibility
              value={value}
              onChange={onChangeValue}
              label={label}
              disabled={isDisabled}
              handlers={handlers}
              {...commonInputProps}
            />
          </InputContainer>
        );
      }

      const componentType = chooseSelectComponentType(
        item.component,
        item.repeats,
        options?.length,
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
            {...commonInputProps}
            maxWidth='100%'
            labelSx={{ maxWidth: MAX_INPUT_AND_LABEL_WIDTH }}
          />
        ) : (
          <RadioGroupInput
            value={currentValue}
            onChange={onChangeValue}
            options={options || []}
            clearable
            {...commonInputProps}
            maxWidth='100%'
            labelSx={{ maxWidth: MAX_INPUT_AND_LABEL_WIDTH }}
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
            textInputProps={{ name: linkId, horizontal }}
            {...commonInputProps}
            maxWidth={MAX_INPUT_AND_LABEL_WIDTH}
            inputWidth={width}
          />
        );
      }

      return (
        <InputContainer {...commonContainerProps}>
          {inputComponent}
        </InputContainer>
      );
    case ItemType.Image:
      return (
        <InputContainer {...commonContainerProps}>
          <LabelWithContent label={item.text} helperText={item.helperText}>
            <Uploader
              multiple={item.repeats || false}
              id={linkId}
              files={value}
              image
              onChange={onChangeValue}
              ariaLabel={item.text}
              disabled={commonInputProps.disabled}
            />
          </LabelWithContent>
        </InputContainer>
      );
    case ItemType.File:
      return (
        <InputContainer {...commonContainerProps}>
          <LabelWithContent label={item.text} helperText={item.helperText}>
            <Uploader
              multiple={item.repeats || false}
              id={linkId}
              files={value}
              onChange={onChangeValue}
              ariaLabel={item.text}
              disabled={commonInputProps.disabled}
            />
          </LabelWithContent>
        </InputContainer>
      );
    case ItemType.Geolocation:
      const coordinates = safeParseLatLon(value);
      return (
        <InputContainer {...commonContainerProps}>
          <GeolocationInput
            label={label}
            value={coordinates}
            onChange={onChangeValue}
            helperText={commonInputProps.helperText}
            disabled={commonInputProps.disabled}
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
