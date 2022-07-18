import { useQuery } from '@apollo/client';
import { Typography, Box, Autocomplete } from '@mui/material';

import TextInput from './TextInput';

import { GET_PROJECTS } from '@/api/projects.gql';

// FIXME codegen
interface Organization {
  label: string;
  options: Omit<ProjectOption, 'organization'>[];
}

export interface ProjectOption {
  readonly value: string;
  readonly label: string;
  readonly projectType: string;
  readonly organization: string;
}

const renderOption = (props: object, option: ProjectOption) => (
  <li {...props}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 1 }}>
      <Typography variant='body2'>{option.label}</Typography>
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
  value: ProjectOption[] | ProjectOption | null;
  onChange: (option: ProjectOption | ProjectOption[] | null) => void;
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
    row.options.map((option) => {
      projectRows.push({ ...option, organization: row.label });
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
      groupBy={(option) => option.organization}
      renderOption={renderOption}
      renderInput={(params) => <TextInput {...params} label='Projects' />}
      isOptionEqualToValue={(option: ProjectOption, value: ProjectOption) =>
        option.value === value.value
      }
    />
  );
};

export default ProjectSelect;
