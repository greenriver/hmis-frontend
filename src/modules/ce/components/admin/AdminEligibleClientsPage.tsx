import React from 'react';
import PageTitle from '@/components/layout/PageTitle';
import AdminCeClientsTable from '@/modules/ce/components/admin/AdminCeClientsTable';

const AdminEligibleClientsPage: React.FC = () => {
  return (
    <>
      <PageTitle title='Eligible Clients' overlineText='Coordinated Entry' />
      <AdminCeClientsTable />
    </>
  );
};

export default AdminEligibleClientsPage;
