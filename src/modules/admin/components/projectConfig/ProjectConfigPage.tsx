import AddIcon from '@mui/icons-material/Add';
import { Button, Paper } from '@mui/material';
import { useState } from 'react';

import ProjectConfigDialog from './ProjectConfigDialog';
import ProjectConfigTable from './ProjectConfigTable';
import PageTitle from '@/components/layout/PageTitle';
import { ProjectConfigFieldsFragment } from '@/types/gqlTypes';

const ProjectConfigPage = () => {
  const [selected, setSelected] = useState<ProjectConfigFieldsFragment | null>(
    null
  );
  return (
    <>
      <PageTitle
        title='Project Configs'
        actions={
          <Button
            onClick={() => setSelected({} as ProjectConfigFieldsFragment)}
            startIcon={<AddIcon />}
            variant='outlined'
          >
            New Project Config
          </Button>
        }
      />
      <Paper>
        <ProjectConfigTable onClickRow={setSelected} />
      </Paper>
      {selected && (
        <ProjectConfigDialog
          open={!!selected}
          config={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
};

export default ProjectConfigPage;
