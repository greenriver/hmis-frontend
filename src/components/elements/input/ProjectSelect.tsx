import { AutocompleteValue, Box, Typography } from '@mui/material';
import { compact } from 'lodash-es';

import GenericSelect, { GenericSelectProps } from './GenericSelect';

import {
  PickListOption,
  PickListType,
  useGetPickListQuery,
} from '@/types/gqlTypes';

export type Option = PickListOption;

// FIXME dedup use FormSelect

export const renderOption = (props: object, option: Option) => (
  <li {...props} key={option.code}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 1 }}>
      <Typography variant='body2'>{option.label}</Typography>
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

const ProjectSelect = <Multiple extends boolean | undefined>({
  multiple,
  label = multiple ? 'Projects' : 'Project',
  value,
  ...props
}: Omit<GenericSelectProps<Option, Multiple, undefined>, 'options'>) => {
  const {
    data: { pickList } = {},
    loading,
    error,
  } = useGetPickListQuery({
    variables: { pickListType: PickListType.Project },
  });

  if (error) console.error(error);

  // special case to replace value with complete option value.
  // e.g. {id: 50} becomes {id: 50, projectName: "White Ash Home"}
  // this is needed for cases when initially selected values are loaded from URL params
  if (Array.isArray(value) && value[0] && !value[0].label && pickList) {
    value = compact(
      value.map(({ code }) => pickList.find((opt) => opt.code === code))
    ) as AutocompleteValue<Option, Multiple, boolean, undefined>;
  }

  return (
    <GenericSelect
      data-testid='projectSelect'
      getOptionLabel={(option) => option.label || option.code}
      groupBy={(option) => option.groupLabel || ''}
      label={label}
      loading={loading}
      multiple={multiple}
      options={pickList || []}
      renderOption={renderOption}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      value={value}
      {...props}
    />
  );
};

export default ProjectSelect;
