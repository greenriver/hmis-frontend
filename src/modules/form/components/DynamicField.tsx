import { Stack, Typography } from '@mui/material';
import React, { ReactNode } from 'react';

import { DynamicInputCommonProps } from '../formUtil';
import { usePickList } from '../hooks/usePickList';

import CreatableFormSelect from './CreatableFormSelect';
import FormSelect from './FormSelect';
import InputContainer from './InputContainer';
import ItemGroup from './ItemGroup';

import DatePicker from '@/components/elements/input/DatePicker';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import OrganizationSelect from '@/components/elements/input/OrganizationSelect';
import ProjectSelect from '@/components/elements/input/ProjectSelect';
import TextInput from '@/components/elements/input/TextInput';
import { FormItem, ItemType, ValidationError } from '@/types/gqlTypes';

interface Props {
  item: FormItem;
  itemChanged: (uid: string, value: any) => void;
  nestingLevel: number;
  value: any;
  disabled?: boolean;
  children?: (item: FormItem) => ReactNode;
  errors?: ValidationError[];
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

  const [options, pickListLoading] = usePickList(item);

  switch (item.type) {
    case ItemType.Display:
      return label;
    case ItemType.Group:
      return (
        <ItemGroup item={item} nestingLevel={nestingLevel}>
          {children && item.item?.map((childItem) => children(childItem))}
        </ItemGroup>
      );
    case ItemType.Boolean:
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
    case ItemType.String:
    case ItemType.Text:
    case ItemType.Integer:
      const multiline = item.type === ItemType.Text;
      const numeric = item.type === ItemType.Integer;
      return (
        <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
          <TextInput
            id={item.linkId}
            name={item.linkId}
            value={value as string}
            onChange={onChangeEvent}
            multiline={multiline}
            minRows={multiline ? 3 : undefined}
            type={numeric ? 'number' : undefined}
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
            {...commonInputProps}
          />
        </InputContainer>
      );
    case ItemType.Choice:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const selectedVal = value ? value : item.repeats ? [] : null;

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
      } else {
        inputComponent = (
          <FormSelect
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={selectedVal}
            options={options || []}
            onChange={onChangeEventValue}
            multiple={!!item.repeats}
            loading={pickListLoading}
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
