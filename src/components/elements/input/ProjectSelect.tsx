import { useQuery } from '@apollo/client';
import { Typography, Box } from '@mui/material';

import GenericSelect, { GenericSelectProps, Option } from './GenericSelect';

import { GET_PROJECTS } from '@/api/projects.gql';

export interface ProjectOption extends Option {
  readonly projectName: string;
  readonly projectType: string;
  readonly organization: { organizationName: string };
}

export type ProjectSelectValue = ProjectOption[] | ProjectOption | null;

const renderOption = (props: object, option: ProjectOption) => (
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

const ProjectSelect: React.FC<
  Omit<GenericSelectProps<ProjectOption>, 'options'>
> = ({ multiple, label = multiple ? 'Projects' : 'Project', ...props }) => {
  const { data, loading, error } = useQuery<{
    projects: ProjectOption[];
  }>(GET_PROJECTS);
  if (error) console.error(error);

  return (
    <GenericSelect<ProjectOption>
      getOptionLabel={(option) => option.projectName}
      groupBy={(option) => option.organization.organizationName}
      label={label}
      loading={loading}
      multiple={multiple}
      options={data?.projects || []}
      renderOption={renderOption}
      {...props}
    />
  );
};

export default ProjectSelect;
