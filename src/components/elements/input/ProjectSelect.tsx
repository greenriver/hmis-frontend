import { useQuery } from '@apollo/client';
import { Typography, Box, Autocomplete } from '@mui/material';

import TextInput from './TextInput';

import { GET_PROJECTS } from '@/api/projects.gql';

// FIXME codegen
interface Organization {
  organizationName: string;
  projects: Omit<ProjectOption, 'organizationName'>[];
}

export interface ProjectOption {
  readonly id: string;
  readonly projectName: string;
  readonly projectType: string;
  readonly organizationName: string;
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
interface Props {
  value: ProjectSelectValue;
  onChange: (option: ProjectSelectValue) => void;
  isMulti?: boolean;
}

const ProjectSelect: React.FC<Props> = ({
  value,
  onChange,
  isMulti: multiple,
}) => {
  const { data, loading, error } = useQuery<{
    organizations: Organization[];
  }>(GET_PROJECTS);
  if (error) console.error(error);

  // Reformat to flat list for Autocomplete
  const options = data?.organizations.reduce((arr, row) => {
    const projectRows: ProjectOption[] = [];
    row.projects.map(({ id, projectName, projectType }) => {
      projectRows.push({
        id,
        projectName,
        projectType,
        organizationName: row.organizationName,
      });
    });
    arr = arr.concat(projectRows);
    return arr;
  }, [] as ProjectOption[]);

  return (
    <Autocomplete
      loading={loading}
      options={options || []}
      value={value}
      onChange={(_, selected) => onChange(selected)}
      multiple={multiple}
      groupBy={(option) => option.organizationName}
      renderOption={renderOption}
      getOptionLabel={(option) => option.projectName}
      renderInput={(params) => <TextInput {...params} label='Projects' />}
      isOptionEqualToValue={(option: ProjectOption, value: ProjectOption) =>
        option.id === value.id
      }
    />
  );
};

export default ProjectSelect;
