import { Typography } from '@mui/material';

import { AnswerOption } from '../types';

import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';

type Option = AnswerOption;

export type SelectValue = Option[] | Option | null;

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

interface Props extends Omit<GenericSelectProps<Option>, 'options'> {
  options: AnswerOption[];
}

const FormSelect: React.FC<Props> = ({
  options,
  multiple,
  label,
  ...props
}) => {
  const isGrouped = !!options[0]?.valueCoding?.displayGroup;
  return (
    <GenericSelect<AnswerOption>
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
      {...props}
    />
  );
};

export default FormSelect;
