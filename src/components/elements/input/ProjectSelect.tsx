import { useQuery } from '@apollo/client';
import { Typography, Box } from '@mui/material';
import Select, { OnChangeValue } from 'react-select';

import { GET_PROJECTS } from '@/api/projects.gql';

export interface ProjectOption {
  readonly label: string;
  readonly value: string;
  readonly projectType: string;
}

// Organization
export interface GroupedOption {
  readonly label: string;
  readonly value: string;
  readonly dataSource: string;
  readonly options: readonly ProjectOption[];
}

const formatGroupLabel = (data: GroupedOption) => (
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    data: projectData,
    loading,
    error,
  } = useQuery<{ projectsForSelect: GroupedOption[] }>(GET_PROJECTS);

  if (error) console.error(error);

  // TEMP using mock provider
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const options = projectData?.projectsForSelect || [];

  // FIXME replace with GQL query that returns grouped project list
  // let options;
  // if (projectData) {
  //   const grouped = projectData.projects.reduce(function (
  //     r: { [x: string]: { label: any; value: any }[] },
  //     a: { projectType: string; name: any; id: any }
  //   ) {
  //     const key = a.projectType || 'other';
  //     const val = { label: a.name, value: a.id };
  //     r[key] = r[key] || [];
  //     r[key].push(val);
  //     return r;
  //   },
  //   Object.create(null));
  //   options = [];
  //   Object.keys(grouped).forEach((k) => {
  //     options.push({
  //       label: k,
  //       options: grouped[k],
  //     });
  //   });
  // }

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
