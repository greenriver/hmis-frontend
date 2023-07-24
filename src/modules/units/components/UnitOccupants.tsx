import { Typography } from '@mui/material';
import pluralize from 'pluralize';

import RouterLink from '@/components/elements/RouterLink';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { RelationshipToHoH, UnitFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const UnitOccupants = ({ unit }: { unit: UnitFieldsFragment }) => {
  if (unit.occupants.length === 0) {
    return (
      <Typography variant='body2' color='text.disabled'>
        Empty
      </Typography>
    );
  }
  let occupant = unit.occupants.find(
    (e) => e.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
  );
  if (!occupant) occupant = unit.occupants[0];

  const numOthers = unit.occupants.length - 1;
  const andOthers =
    numOthers > 0 ? ` and ${numOthers} ${pluralize('other', numOthers)}` : '';
  return (
    <RouterLink
      to={generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
        clientId: occupant.client.id,
        enrollmentId: occupant.id,
      })}
      openInNew
    >
      {`${clientBriefName(occupant.client)}${andOthers}`}
    </RouterLink>
  );
};
export default UnitOccupants;
