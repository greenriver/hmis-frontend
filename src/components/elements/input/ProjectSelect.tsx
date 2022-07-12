/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

const formatOptionLabel = ({ label }: ProjectOption) => (
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
      ES
    </Typography>
  </Box>
);

interface Props {
  value: ProjectOption[] | ProjectOption | null;
  onChange: (option: OnChangeValue<ProjectOption, boolean>) => void;
  isMulti?: boolean;
}

const ProjectSelect: React.FC<Props> = ({ value, onChange, isMulti }) => {
  const { data: projectData, loading, error } = useQuery(GET_PROJECTS);

  if (error) return <Box>{`Error! ${error.message}`}</Box>;

  // FIXME replace with GQL query that returns grouped project list
  let options;
  if (projectData) {
    const grouped = projectData.projects.reduce(function (
      r: { [x: string]: { label: any; value: any }[] },
      a: { projectType: string; name: any; id: any }
    ) {
      const key = a.projectType || 'other';
      const val = { label: a.name, value: a.id };
      r[key] = r[key] || [];
      r[key].push(val);
      return r;
    },
    Object.create(null));
    options = [];
    Object.keys(grouped).forEach((k) => {
      options.push({
        label: k,
        options: grouped[k],
      });
    });
  }

  return (
    <Select
      isLoading={loading}
      placeholder={isMulti ? 'Projects' : 'Project'}
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
