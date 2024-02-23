import AddIcon from '@mui/icons-material/Add';
import { Button, Paper } from '@mui/material';
import { useState } from 'react';

import ProjectConfigDialog from './ProjectConfigDialog';
import ProjectConfigTable from './ProjectConfigTable';
import PageTitle from '@/components/layout/PageTitle';

const ProjectConfigPage = () => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <PageTitle
        title='Project Configs'
        actions={
          <Button
            onClick={() => setSelected('new')}
            startIcon={<AddIcon />}
            variant='outlined'
          >
            New Project Config
          </Button>
        }
      />
      <Paper>
        <ProjectConfigTable selectedId={selected} setSelectedId={setSelected} />
      </Paper>
      <ProjectConfigDialog
        open={!!selected}
        projectId={selected || ''}
        onClose={() => setSelected(null)}
      />
    </>
  );
};

export default ProjectConfigPage;
