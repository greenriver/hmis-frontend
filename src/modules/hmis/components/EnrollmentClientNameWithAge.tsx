import { Stack } from '@mui/system';
import { isNil } from 'lodash-es';
import { EnrollmentDashboardRoutes } from '@/app/routes';
import RouterLink from '@/components/elements/RouterLink';
import ClientName from '@/modules/client/components/ClientName';
import { ClientNameFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const EnrollmentClientNameWithAge: React.FC<{
  enrollmentId: string;
  client: { age?: number | null } & ClientNameFragment;
}> = ({ enrollmentId, client }) => {
  return (
    <Stack direction='row' gap={0.8} whiteSpace='nowrap'>
      <RouterLink
        key={'client'}
        to={generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
          clientId: client.id,
          enrollmentId,
        })}
      >
        <ClientName client={client} key='name' />
      </RouterLink>
      {!isNil(client.age) && <span>{`(${client.age})`}</span>}
    </Stack>
  );
};

export default EnrollmentClientNameWithAge;
