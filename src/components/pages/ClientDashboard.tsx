import { useQuery } from '@apollo/client';
import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

import ClientCard from '../elements/ClientCard';
import Loading from '../elements/Loading';
import ClientDashboardTabs from '../layout/ClientDashboardTabs';
import PageHeader from '../layout/PageHeader';

import { GET_CLIENTS } from '@/api/clients.gql';
import * as HmisUtil from '@/modules/hmis/util';
import { Client, ClientsPaginated } from '@/types/gqlTypes';
const Profile: React.FC<{ client: Client }> = ({ client }) => (
  <ClientCard client={client} />
);

const ClientDashboard: React.FC = () => {
  const { clientId } = useParams() as { clientId: string };
  const { data, loading, error } = useQuery<ClientsPaginated>(GET_CLIENTS, {
    variables: {
      input: { id: clientId },
      limit: 1,
      offset: 0,
    },
  });

  if (error) throw error;
  if (loading || !data) return <Loading />;
  const client = data?.nodes[0];

  const tabs = [
    {
      label: 'Profile',
      key: 'profile',
      render: () => <Profile client={client} />,
    },
    {
      label: 'Enrollments',
      key: 'enrollments',
      render: () => <div>enrollments</div>,
    },
    {
      label: 'History',
      key: 'history',
      render: () => <div>history</div>,
    },
    {
      label: 'Assessments',
      key: 'assessments',
      render: () => <div>assessments</div>,
    },
    {
      label: 'Notes',
      key: 'notes',
      render: () => <></>,
    },
    {
      label: 'Files',
      key: 'files',
      render: () => <></>,
    },
    {
      label: 'Contact',
      key: 'contact',
      render: () => <></>,
    },
    {
      label: 'Locations',
      key: 'locations',
      render: () => <></>,
    },
    {
      label: 'Referrals',
      key: 'referrals',
      render: () => <></>,
    },
  ];

  return (
    <>
      <PageHeader>
        <Typography variant='h5'>{HmisUtil.name(client)}</Typography>
      </PageHeader>
      <ClientDashboardTabs tabs={tabs} />
    </>
  );
};

export default ClientDashboard;
