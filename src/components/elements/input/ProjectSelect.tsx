import { Box, Typography } from '@mui/material';

import { useCallback } from 'react';
import GenericSelect, { GenericSelectProps } from './GenericSelect';

import { findOptionLabel } from '@/modules/form/util/formUtil';
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
      <Typography variant='body2'>{option.label || option.code}</Typography>
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

  const getOptionLabel = useCallback(
    (option: Option) => findOptionLabel(option, pickList as PickListOption[]),
    [pickList]
  );

  return (
    <GenericSelect
      data-testid='projectSelect'
      getOptionLabel={getOptionLabel}
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
