import { Box, Typography } from '@mui/material';

import { DynamicInputCommonProps } from './DynamicField';

import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';
import { PickListOption } from '@/types/gqlTypes';

type Option = PickListOption;

const optionId = (option: Option): string => {
  return option.code || '';
};

const optionLabel = (option: Option): string => {
  return option.label || option.code || '';
};

const renderOption = (props: object, option: Option) => (
  <li {...props} key={optionId(option)}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 1 }}>
      <Typography variant='body2'>{optionLabel(option)}</Typography>
      {option.secondaryLabel && (
        <Typography
          variant='body2'
          sx={{
            ml: 1,
            color: 'text.secondary',
          }}
        >
          {option.secondaryLabel}
        </Typography>
      )}
    </Box>
  </li>
);

const FormSelect = <Multiple extends boolean | undefined>({
  options,
  multiple,
  label,
  value,
  error,
  placeholder,
  helperText,
  ...props
}: GenericSelectProps<Option, Multiple, false> & DynamicInputCommonProps) => {
  const isGrouped = !!options[0]?.groupLabel;
  // console.log(props.placeholder);
  return (
    <GenericSelect
      getOptionLabel={(option) => optionLabel(option)}
      label={label}
      multiple={multiple}
      options={options}
      renderOption={renderOption}
      groupBy={isGrouped ? (option) => option.groupLabel || '' : undefined}
      isOptionEqualToValue={(option, value) =>
        optionId(option) === optionId(value)
      }
      value={value}
      {...props}
      textInputProps={{
        ...props.textInputProps,
        placeholder,
        error,
        helperText,
      }}
    />
  );
};

export default FormSelect;
