import pluralize from 'pluralize';

import { clientBriefName } from '@/modules/hmis/hmisUtil';
import {
  RelationshipToHoH,
  UnitTableRowFieldsFragment,
} from '@/types/gqlTypes';

const UnitOccupants = ({ unit }: { unit: UnitTableRowFieldsFragment }) => {
  if (!unit.occupants) return null;
  if (unit.occupants.length === 0) return null;

  let occupant = unit.occupants.find(
    (e) => e.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
  );
  if (!occupant) occupant = unit.occupants[0];

  const numOthers = unit.occupants.length - 1;
  const andOthers =
    numOthers > 0 ? ` and ${numOthers} ${pluralize('other', numOthers)}` : '';

  return `${clientBriefName(occupant.client)}${andOthers}`;
};

export default UnitOccupants;
