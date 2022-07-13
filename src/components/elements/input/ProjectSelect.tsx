import { useQuery } from '@apollo/client';
import { Typography, Box } from '@mui/material';
import Select, { OnChangeValue, GroupBase } from 'react-select';

import { GET_PROJECTS } from '@/api/projects.gql';

export interface ProjectOption {
  readonly value: string;
  readonly label: string;
  readonly projectType: string;
}

const formatGroupLabel = (data: GroupBase<ProjectOption>) => (
  <Typography variant='body2'>{data.label}</Typography>
);

const formatOptionLabel = ({ label, projectType }: ProjectOption) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant='body2' sx={{ ml: 1 }}>
      {label}
    </Typography>
    <Typography
      variant='body2'
      sx={{
        ml: 1,
        color: '#4d4d4d',
      }}
    >
      {projectType}
    </Typography>
  </Box>
);

interface Props {
  value: ProjectOption[] | ProjectOption | null;
  onChange: (option: OnChangeValue<ProjectOption, boolean>) => void;
  isMulti?: boolean;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

const ProjectSelect: React.FC<Props> = ({ value, onChange, isMulti }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    data: projectData,
    loading,
    error,
  } = useQuery<{ projectsForSelect: GroupBase<ProjectOption>[] }>(GET_PROJECTS);
  if (error) console.error(error);

  // TEMP using mock provider
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const options = projectData?.projectsForSelect || [];

  return (
    <Select
      isLoading={loading}
      placeholder={error ? 'Error' : `Project${isMulti ? 's' : ''}`}
      formatOptionLabel={formatOptionLabel}
      formatGroupLabel={formatGroupLabel}
      value={value}
      onChange={onChange}
      options={options}
      isMulti={isMulti || undefined}
    />
  );
};

export default ProjectSelect;
