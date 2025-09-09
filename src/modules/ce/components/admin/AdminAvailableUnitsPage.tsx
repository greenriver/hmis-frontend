import React from 'react';
import PageTitle from '@/components/layout/PageTitle';
import AdminOpportunitiesTable from '@/modules/ce/components/admin/AdminOpportunitiesTable';

const AdminAvailableUnitsPage: React.FC = () => {
  return (
    <>
      <PageTitle title='Available Units' overlineText='Coordinated Entry' />
      <AdminOpportunitiesTable />,
    </>
  );
};

export default AdminAvailableUnitsPage;
