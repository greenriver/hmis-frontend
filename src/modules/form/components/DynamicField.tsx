import { Stack, Typography } from '@mui/material';
import { isNil } from 'lodash-es';
import React, { ReactNode } from 'react';

import { usePickList } from '../hooks/usePickList';
import { isPickListOption } from '../util/formUtil';

import CreatableFormSelect from './CreatableFormSelect';
import DynamicDisplay from './DynamicDisplay';
import FormSelect from './FormSelect';
import InputContainer from './InputContainer';

import DatePicker from '@/components/elements/input/DatePicker';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import NumberInput from '@/components/elements/input/NumberInput';
import OrganizationSelect from '@/components/elements/input/OrganizationSelect';
import ProjectSelect from '@/components/elements/input/ProjectSelect';
import TextInput from '@/components/elements/input/TextInput';
import ToggleButtonGroupInput from '@/components/elements/input/ToggleButtonGroupInput';
import YesNoInput from '@/components/elements/input/YesNoInput';
import {
  Component,
  FormItem,
  ItemType,
  ValidationError,
} from '@/types/gqlTypes';

export interface DynamicInputCommonProps {
  disabled?: boolean;
  label?: ReactNode;
  error?: boolean;
  helperText?: ReactNode;
  min?: any;
  max?: any;
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
}

const getLabel = (item: FormItem) => {
  if (!item.prefix && !item.text) return null;

  return (
    <Stack direction='row' spacing={1}>
      <Typography variant='body2'>{item.text}</Typography>
      {item.required && (
        <Typography variant='body2' color='error'>
          (Required)
        </Typography>
      )}
    </Stack>
  );
};

const MAX_INPUT_AND_LABEL_WIDTH = 600; // allow label to extend past input before wrapping
const MAX_INPUT_WIDTH = 400;
const FIXED_DATE_WIDTH = 200;

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
}) => {
  const onChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) =>
    itemChanged(item.linkId, e.target.value);
  const onChangeValue = (val: any) => itemChanged(item.linkId, val);
  const onChangeEventValue = (_: any, val: any) =>
    itemChanged(item.linkId, val);
  const label = getLabel(item);
  const maxWidth = maxWidthAtNestingLevel(nestingLevel);
  const minWidth = 250;

  const commonContainerProps = { errors, horizontal };

  const commonInputProps: DynamicInputCommonProps = {
    disabled,
    label,
    error: !!(errors && errors.length > 0),
    ...inputProps,
  };

  const [options, pickListLoading] = usePickList(item, {
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
  });

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
              id={item.linkId}
              name={item.linkId}
              horizontal={horizontal}
              {...commonInputProps}
            />
          </InputContainer>
        );
      }
      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          <YesNoInput
            value={value}
            onChange={onChangeEventValue}
            id={item.linkId}
            name={item.linkId}
            nullable={!item.required}
            horizontal={horizontal}
            // includeNullOption
            {...commonInputProps}
          />
        </InputContainer>
      );
    case ItemType.String:
    case ItemType.Text:
      const multiline = item.type === ItemType.Text;
      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          <TextInput
            id={item.linkId}
            name={item.linkId}
            value={value || ''}
            onChange={onChangeEvent}
            multiline={multiline}
            minRows={multiline ? 3 : undefined}
            horizontal={horizontal}
            sx={{
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
            id={item.linkId}
            name={item.linkId}
            value={isNil(value) ? '' : value}
            onChange={onChangeEvent}
            horizontal={horizontal}
            currency={item.type === ItemType.Currency}
            {...commonInputProps}
          />
        </InputContainer>
      );
    case ItemType.Date:
      // case ItemType.Dob:
      const datePickerProps = {};
      // item.type === ItemType.Dob
      //   ? { openTo: 'year' as CalendarPickerView, disableFuture: true }
      //   : {};
      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          <DatePicker
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={value || null}
            onChange={onChangeValue}
            textInputProps={{
              name: item.linkId,
              horizontal,
              sx: { width: FIXED_DATE_WIDTH },
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
            textInputProps={{
              name: item.linkId,
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
      } else if (item.pickListReference === 'NoYesReasonsForMissingData') {
        inputComponent = (
          //   <RadioGroupInput
          //   value={selectedVal}
          //   onChange={onChangeValue}
          //   id={item.linkId}
          //   name={item.linkId}
          //   options={options || []}
          //   {...commonInputProps}
          // />
          <ToggleButtonGroupInput
            value={selectedVal}
            onChange={onChangeEventValue}
            id={item.linkId}
            name={item.linkId}
            horizontal={horizontal}
            options={options || []}
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
            textInputProps={{
              name: item.linkId,
              horizontal,
              sx: {
                maxWidth: MAX_INPUT_AND_LABEL_WIDTH,
                '.MuiInputBase-root': { maxWidth: MAX_INPUT_WIDTH },
              },
            }}
            {...commonInputProps}
          />
        );
      }

      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          {inputComponent}
        </InputContainer>
      );
    default:
      console.warn('Unrecognized item type:', item.type);
      return <></>;
  }
};

export default DynamicField;
