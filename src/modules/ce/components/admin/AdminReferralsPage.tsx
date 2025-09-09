import React from 'react';
import PageTitle from '@/components/layout/PageTitle';
import AdminReferralsTable from '@/modules/ce/components/admin/AdminReferralsTable';

const AdminReferralsPage: React.FC = () => {
  return (
    <>
      <PageTitle title='Referrals' overlineText='Coordinated Entry' />
      <AdminReferralsTable />
    </>
  );
};

export default AdminReferralsPage;
