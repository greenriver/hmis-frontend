import { useQuery } from '@apollo/client';
import {
  Typography,
  Box,
  Autocomplete,
  AutocompleteProps,
} from '@mui/material';

import TextInput from './TextInput';

import { GET_PROJECTS } from '@/api/projects.gql';

export interface ProjectOption {
  readonly id: string;
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

interface Props
  extends Omit<
    AutocompleteProps<
      ProjectOption,
      boolean,
      undefined,
      undefined,
      React.ElementType
    >,
    'onChange' | 'renderInput' | 'value' | 'options'
  > {
  value: ProjectSelectValue;
  onChange: (option: ProjectSelectValue) => void;
}

const ProjectSelect: React.FC<Props> = ({ value, onChange, ...rest }) => {
  const { data, loading, error } = useQuery<{
    projects: ProjectOption[];
  }>(GET_PROJECTS);
  if (error) console.error(error);

  // FIXME: sort in graphql, not here
  const options = (data?.projects || []).slice().sort((a, b) => {
    const org1 = a.organization.organizationName;
    const org2 = b.organization.organizationName;
    return org1.localeCompare(org2);
  });

  return (
    <Autocomplete
      loading={loading}
      options={options}
      value={value}
      onChange={(_, selected) => onChange(selected)}
      groupBy={(option) => option.organization.organizationName}
      renderOption={renderOption}
      getOptionLabel={(option) => option.projectName}
      renderInput={(params) => <TextInput {...params} label='Projects' />}
      isOptionEqualToValue={(option: ProjectOption, value: ProjectOption) =>
        option.id === value.id
      }
      {...rest}
    />
  );
};

export default ProjectSelect;
