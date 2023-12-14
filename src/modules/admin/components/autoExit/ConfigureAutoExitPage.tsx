import AddIcon from '@mui/icons-material/Add';
import { Button, Paper } from '@mui/material';
import { useState } from 'react';

import AutoExitDialog from './AutoExitDialog';
import AutoExitTable from './AutoExitTable';
import PageTitle from '@/components/layout/PageTitle';

const ConfigureAutoExitPage = () => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <PageTitle
        title='Auto Exit Configs'
        actions={
          <Button
            onClick={() => setSelected('new')}
            startIcon={<AddIcon />}
            variant='outlined'
          >
            New Auto Exit Config
          </Button>
        }
      />
      <Paper>
        <AutoExitTable selectedId={selected} setSelectedId={setSelected} />
      </Paper>
      <AutoExitDialog
        open={!!selected}
        autoExitId={selected || ''}
        onClose={() => setSelected(null)}
      />
    </>
  );
};

export default ConfigureAutoExitPage;
