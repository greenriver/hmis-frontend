import React from 'react';
import PageTitle from '@/components/layout/PageTitle';
import AdminDefaultContactsTable from '@/modules/ce/components/admin/AdminDefaultContactsTable';

const AdminDefaultContactsPage: React.FC = () => {
  return (
    <>
      <PageTitle title='Default Contacts' overlineText='Coordinated Entry' />
      <AdminDefaultContactsTable />,
    </>
  );
};

export default AdminDefaultContactsPage;
