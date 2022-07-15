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
}

const ProjectSelect: React.FC<Props> = ({ value, onChange, isMulti }) => {
  const { data, loading, error } = useQuery<{
    organizations: GroupBase<ProjectOption>[];
  }>(GET_PROJECTS);
  if (error) console.error(error);
  return (
    <Select
      isLoading={loading}
      placeholder={error ? 'Error' : `Project${isMulti ? 's' : ''}`}
      formatOptionLabel={formatOptionLabel}
      formatGroupLabel={formatGroupLabel}
      value={value}
      onChange={onChange}
      options={data?.organizations || []}
      isMulti={isMulti || undefined}
    />
  );
};

export default ProjectSelect;
