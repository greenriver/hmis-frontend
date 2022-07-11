/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useQuery } from '@apollo/client';
import { Typography, Box } from '@mui/material';
import Select, { OnChangeValue } from 'react-select';

import { GET_PROJECTS } from '@/api/projects.gql';

export type ProjectOptionType = {
  label: string;
  value: string;
  projectType: string;
};

const formatOptionLabel = ({ label }: ProjectOptionType) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant='body2'>{label}</Typography>
    <Typography
      variant='body2'
      sx={{
        ml: 2,
        color: '#ccc',
      }}
    >
      ES
    </Typography>
  </Box>
);

interface Props {
  value: ProjectOptionType[] | ProjectOptionType | null | undefined;
  onChange: (option: OnChangeValue<ProjectOptionType, true>) => void;
}

const ProjectSelect: React.FC<Props> = ({ value, onChange }) => {
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
      placeholder='Projects'
      formatOptionLabel={formatOptionLabel}
      // formatGroupLabel
      value={value}
      onChange={onChange}
      options={options}
      isMulti
    />
  );
};

export default ProjectSelect;
