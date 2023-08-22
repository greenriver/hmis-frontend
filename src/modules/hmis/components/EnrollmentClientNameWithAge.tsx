import { Stack } from '@mui/system';
import { isNil } from 'lodash-es';
import ClientDobAge from './ClientDobAge';
import RouterLink from '@/components/elements/RouterLink';
import ClientName from '@/modules/client/components/ClientName';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  ClientIdentificationFieldsFragment,
  ClientNameFragment,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const EnrollmentClientNameWithAge: React.FC<{
  enrollmentId: string;
  client: ClientIdentificationFieldsFragment & ClientNameFragment;
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
      {!isNil(client.age) && (
        <span>
          <Stack direction={'row'}>
            (<ClientDobAge client={client} noDob key='age' />)
          </Stack>
        </span>
      )}
    </Stack>
  );
};

export default EnrollmentClientNameWithAge;
