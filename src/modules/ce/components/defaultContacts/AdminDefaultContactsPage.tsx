import { Button } from '@mui/material';
import React, { useState } from 'react';
import { GlobalIcon } from '@/components/elements/SemanticIcons';
import PageTitle from '@/components/layout/PageTitle';
import AdminDefaultContactsTable from '@/modules/ce/components/defaultContacts/AdminDefaultContactsTable';
import EditCeDefaultContactsModal from '@/modules/ce/components/defaultContacts/EditCeDefaultContactsModal';

const AdminDefaultContactsPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <PageTitle
        title='Default Contacts'
        overlineText='Coordinated Entry'
        actions={
          <Button
            startIcon={<GlobalIcon />}
            variant='outlined'
            onClick={() => setDialogOpen(true)}
          >
            Edit Global Contacts
          </Button>
        }
      />
      <AdminDefaultContactsTable />
      {dialogOpen && (
        <EditCeDefaultContactsModal
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  );
};

export default AdminDefaultContactsPage;
