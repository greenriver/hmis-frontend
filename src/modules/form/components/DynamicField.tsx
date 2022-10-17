import { Stack, Typography } from '@mui/material';
import { CalendarPickerView } from '@mui/x-date-pickers';
import React, { ReactNode } from 'react';

import { resolveAnswerValueSet } from '../formUtil';
import { DynamicInputCommonProps, FieldType, Item } from '../types';

import CreatableFormSelect from './CreatableFormSelect';
import FormSelect from './FormSelect';
import InputContainer from './InputContainer';
import ItemGroup from './ItemGroup';

import DatePicker from '@/components/elements/input/DatePicker';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import OrganizationSelect from '@/components/elements/input/OrganizationSelect';
import ProjectSelect from '@/components/elements/input/ProjectSelect';
import TextInput from '@/components/elements/input/TextInput';
import { ValidationError } from '@/types/gqlTypes';

interface Props {
  item: Item;
  itemChanged: (uid: string, value: any) => void;
  nestingLevel: number;
  value: any;
  disabled?: boolean;
  children?: (item: Item) => ReactNode;
  errors?: ValidationError[];
}

const getLabel = (item: Item) => {
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

const DynamicField: React.FC<Props> = ({
  item,
  itemChanged,
  nestingLevel,
  value,
  disabled = false,
  errors,
  children,
}) => {
  const onChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) =>
    itemChanged(item.linkId, e.target.value);
  const onChangeValue = (val: any) => itemChanged(item.linkId, val);
  const onChangeEventValue = (_: any, val: any) =>
    itemChanged(item.linkId, val);
  const label = getLabel(item);
  const maxWidth = 600 - nestingLevel * 26;
  const minWidth = 250;

  const commonContainerProps = { errors };

  const commonInputProps: DynamicInputCommonProps = {
    disabled,
    label,
    error: !!(errors && errors.length > 0),
  };

  switch (FieldType[item.type]) {
    case FieldType.display:
      return label;
    case FieldType.group:
      return (
        <ItemGroup item={item} nestingLevel={nestingLevel}>
          {children && item.item?.map((childItem) => children(childItem))}
        </ItemGroup>
      );
    case FieldType.boolean:
      return (
        <InputContainer sx={{ width: 400 }} {...commonContainerProps}>
          <LabeledCheckbox
            checked={!!value}
            onChange={(e) =>
              itemChanged(item.linkId, (e.target as HTMLInputElement).checked)
            }
            id={item.linkId}
            name={item.linkId}
            {...commonInputProps}
          />
        </InputContainer>
      );
    case FieldType.string:
    case FieldType.text:
    case FieldType.ssn:
      const multiline = FieldType[item.type] === FieldType.text;
      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          <TextInput
            id={item.linkId}
            name={item.linkId}
            value={value as string}
            onChange={onChangeEvent}
            multiline={multiline}
            minRows={multiline ? 3 : undefined}
            {...commonInputProps}
          />
        </InputContainer>
      );
    case FieldType.date:
    case FieldType.dob:
      const datePickerProps =
        item.type === FieldType.dob
          ? { openTo: 'year' as CalendarPickerView, disableFuture: true }
          : {};
      return (
        <InputContainer sx={{ width: 250 }} {...commonContainerProps}>
          <DatePicker
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={value || null}
            onChange={onChangeValue}
            {...datePickerProps}
            {...commonInputProps}
          />
        </InputContainer>
      );
    case FieldType.openchoice:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const selectedChoiceVal = value ? value : item.repeats ? [] : null;
      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          <CreatableFormSelect
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={selectedChoiceVal}
            options={
              item.answerValueSet
                ? resolveAnswerValueSet(item.answerValueSet)
                : item.answerOption || []
            }
            onChange={onChangeEventValue}
            multiple={item.repeats}
            {...commonInputProps}
          />
        </InputContainer>
      );
    case FieldType.choice:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const selectedVal = value ? value : item.repeats ? [] : null;

      let inputComponent;
      if (
        item.answerValueSet &&
        ['projects', 'organizations'].includes(item.answerValueSet)
      ) {
        const SelectComponent =
          item.answerValueSet === 'projects'
            ? ProjectSelect
            : OrganizationSelect;
        inputComponent = (
          <SelectComponent
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={selectedVal}
            onChange={onChangeEventValue}
            multiple={item.repeats}
            disabled={disabled}
          />
        );
      } else {
        inputComponent = (
          <FormSelect
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={selectedVal}
            options={
              item.answerValueSet
                ? resolveAnswerValueSet(item.answerValueSet) || []
                : item.answerOption || []
            }
            onChange={onChangeEventValue}
            multiple={item.repeats}
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
      return <></>;
  }
};

export default DynamicField;
