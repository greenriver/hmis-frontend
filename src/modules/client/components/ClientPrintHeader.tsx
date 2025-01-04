import { Typography } from '@mui/material';
import { Stack } from '@mui/system';

import ClientName from './ClientName';

import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { enrollmentName, entryExitRange } from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import {
  ClientNameFragment,
  EnrollmentFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

const ClientPrintHeader = ({
  client,
  enrollment,
}: {
  client: ClientNameFragment;
  enrollment?: EnrollmentFieldsFragment;
}) => (
  <Stack
    direction='row'
    gap={2}
    justifyContent='space-between'
    sx={(theme) => ({
      position: 'running(pageHeader)',
      borderBottom: `1px solid ${theme.palette.divider}`,
      p: 2,
      mb: 2,
    })}
  >
    <Typography component='div'>
      <ClientName client={client} variant='body2' />
    </Typography>
    {enrollment && (
      <>
        {enrollment.relationshipToHoH !==
          RelationshipToHoH.DataNotCollected && (
          <HmisEnum
            variant='body2'
            value={enrollment.relationshipToHoH}
            enumMap={{
              ...HmisEnums.RelationshipToHoH,
              [RelationshipToHoH.SelfHeadOfHousehold]: 'HoH',
            }}
          />
        )}
        <Typography variant='body2'>{enrollmentName(enrollment)}</Typography>
        <Typography variant='body2'>{entryExitRange(enrollment)}</Typography>
      </>
    )}
  </Stack>
);
export default ClientPrintHeader;
