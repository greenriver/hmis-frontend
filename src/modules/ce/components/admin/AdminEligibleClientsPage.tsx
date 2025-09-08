import React from 'react';
import AdminReferralsTable from './AdminReferralsTable';
import PageTitle from '@/components/layout/PageTitle';

const AdminEligibleClientsPage: React.FC = () => {
  return (
    <>
      <PageTitle title='Eligible Clients' overlineText='Coordinated Entry' />
      <AdminReferralsTable />
    </>
  );
};

export default AdminEligibleClientsPage;
