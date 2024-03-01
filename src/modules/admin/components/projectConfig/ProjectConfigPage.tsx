import AddIcon from '@mui/icons-material/Add';
import { Button, Paper } from '@mui/material';
import { useState } from 'react';

import ProjectConfigDialog from './ProjectConfigDialog';
import ProjectConfigTable from './ProjectConfigTable';
import PageTitle from '@/components/layout/PageTitle';
import { ProjectConfigFieldsFragment } from '@/types/gqlTypes';

const ProjectConfigPage = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ProjectConfigFieldsFragment | null>(
    null
  );
  return (
    <>
      <PageTitle
        title='Project Configs'
        actions={
          <Button
            onClick={() => setOpen(true)}
            startIcon={<AddIcon />}
            variant='outlined'
          >
            New Project Config
          </Button>
        }
      />
      <Paper>
        <ProjectConfigTable
          onClickRow={(row) => {
            setOpen(true);
            setSelected(row);
          }}
        />
      </Paper>
      <ProjectConfigDialog
        open={open}
        config={selected}
        onClose={() => {
          setOpen(false);
          setSelected(null);
        }}
      />
    </>
  );
};

export default ProjectConfigPage;
