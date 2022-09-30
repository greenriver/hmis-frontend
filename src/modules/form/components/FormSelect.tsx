import { Typography } from '@mui/material';

import { AnswerOption } from '../types';

import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';

type Option = AnswerOption;

const optionId = (option: Option): string => {
  if (option.valueCoding) {
    return option.valueCoding.code;
  }
  return option.valueString || '';
};

const optionLabel = (option: Option): string => {
  if (option.valueCoding) {
    return option.valueCoding.display || option.valueCoding.code;
  }
  return option.valueString || '';
};

const renderOption = (props: object, option: Option) => (
  <li {...props} key={optionId(option)}>
    <Typography variant='body2'>{optionLabel(option)}</Typography>
  </li>
);

const FormSelect = <Multiple extends boolean | undefined>({
  options,
  multiple,
  label,
  value,
  ...props
}: GenericSelectProps<Option, Multiple, false>) => {
  const isGrouped = !!options[0]?.valueCoding?.displayGroup;

  return (
    <GenericSelect
      getOptionLabel={(option) => optionLabel(option)}
      label={label}
      multiple={multiple}
      options={options}
      renderOption={renderOption}
      groupBy={
        isGrouped
          ? (option) => option.valueCoding?.displayGroup || ''
          : undefined
      }
      isOptionEqualToValue={(option, value) =>
        optionId(option) === optionId(value)
      }
      value={value}
      {...props}
    />
  );
};

export default FormSelect;
