import { Box, Typography } from '@mui/material';

import { find } from 'lodash-es';
import { useCallback } from 'react';
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

export function getOptionLabelFromOptions(
  option: Option,
  options: readonly Option[]
): string {
  if (option.label) return option.label;
  if (option.code === INVALID_ENUM) return 'Invalid Value';
  if (options && options.length > 0 && options[0].label) {
    return find(options, { code: option.code })?.label || '';
  }
  return option.code || '';
}

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

  const getOptionLabel = useCallback(
    (option: Option) => getOptionLabelFromOptions(option, options),
    [options]
  );

  const isOptionEqualToValue = useCallback(
    (option: Option, val: Option) => optionId(option) === optionId(val),
    []
  );

  return (
    <GenericSelect
      getOptionLabel={getOptionLabel}
      label={label}
      multiple={multiple}
      options={options}
      renderOption={renderOption}
      groupBy={isGrouped ? (option) => option.groupLabel || '' : undefined}
      isOptionEqualToValue={isOptionEqualToValue}
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
