import { Typography, Box, AutocompleteValue } from '@mui/material';
import { compact } from 'lodash-es';

import GenericSelect, { GenericSelectProps } from './GenericSelect';

import {
  GetProjectsForSelectQuery,
  useGetProjectsForSelectQuery,
} from '@/types/gqlTypes';

export type Option = GetProjectsForSelectQuery['projects'][0];

const renderOption = (props: object, option: Option) => (
  <li {...props} key={option.id}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 1 }}>
      <Typography variant='body2'>{option.projectName}</Typography>
      <Typography
        variant='body2'
        sx={{
          ml: 1,
          color: 'text.secondary',
        }}
      >
        {option.projectType}
      </Typography>
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
    data: { projects } = {},
    loading,
    error,
  } = useGetProjectsForSelectQuery();

  if (error) console.error(error);

  // special case to replace value with complete option value.
  // e.g. {id: 50} becomes {id: 50, projectName: "White Ash Home"}
  // this is needed for cases when initially selected values are loaded from URL params
  if (Array.isArray(value) && value[0] && !value[0].projectName && projects) {
    value = compact(
      value.map(({ id }) => projects.find((opt) => opt.id === id))
    ) as AutocompleteValue<Option, Multiple, boolean, undefined>;
  }

  return (
    <GenericSelect
      getOptionLabel={(option) => option.projectName || option.id}
      groupBy={(option) => option.organization.organizationName || ''}
      label={label}
      loading={loading}
      multiple={multiple}
      options={projects || []}
      renderOption={renderOption}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      value={value}
      {...props}
    />
  );
};

export default ProjectSelect;
