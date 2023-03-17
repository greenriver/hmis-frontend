import { Box, Typography } from '@mui/material';

import { DynamicInputCommonProps } from '../types';

import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';
import { INVALID_ENUM } from '@/modules/hmis/hmisUtil';
import { PickListOption } from '@/types/gqlTypes';

type Option = PickListOption;

const optionId = (option: Option): string => {
  return option.code || '';
};

const optionLabel = (option: Option): string => {
  if (option.label) return option.label;
  if (option.code === INVALID_ENUM) return 'Invalid Value';
  return option.code || '';
};

const renderOption = (props: object, option: Option) => (
  <li
    {...props}
    key={optionId(option)}
    data-testid={`option-${optionId(option)}`}
  >
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
  warnIfEmptyTreatment,
  ...props
}: GenericSelectProps<Option, Multiple, false> & DynamicInputCommonProps) => {
  const isGrouped = !!options[0]?.groupLabel;

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
        warnIfEmptyTreatment,
      }}
    />
  );
};

export default FormSelect;
