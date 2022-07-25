import { useQuery } from '@apollo/client';
import { Typography, Box } from '@mui/material';

import GenericSelect, { GenericSelectProps } from './GenericSelect';

import { GET_PROJECTS } from '@/api/projects.gql';

export interface Option {
  readonly id: string;
  readonly projectName: string;
  readonly projectType: string;
  readonly organization: { organizationName: string };
}

export type ProjectSelectValue = Option[] | Option | null;

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

const ProjectSelect: React.FC<Omit<GenericSelectProps<Option>, 'options'>> = ({
  multiple,
  label = multiple ? 'Projects' : 'Project',
  ...props
}) => {
  const { data, loading, error } = useQuery<{
    projects: Option[];
  }>(GET_PROJECTS);
  if (error) console.error(error);

  return (
    <GenericSelect<Option>
      getOptionLabel={(option) => option.projectName}
      groupBy={(option) => option.organization.organizationName}
      label={label}
      loading={loading}
      multiple={multiple}
      options={data?.projects || []}
      renderOption={renderOption}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      {...props}
    />
  );
};

export default ProjectSelect;
