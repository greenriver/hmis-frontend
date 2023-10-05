import React from 'react';

import { ClientAddress as GqlClientAddress } from '@/types/gqlTypes';
import { compactJoinNodes } from '@/utils/nodes';

interface Props {
  address: Pick<
    GqlClientAddress,
    'line1' | 'line2' | 'city' | 'district' | 'state' | 'postalCode' | 'notes'
  >;
}

const ClientAddress: React.FC<Props> = ({
  address: { line1, line2, city, district, state, postalCode, notes },
}) => {
  const cityStateZip =
    city || state || postalCode
      ? compactJoinNodes([city, compactJoinNodes([state, postalCode])], ', ')
      : null;
  return (
    <>
      {compactJoinNodes([line1, line2, district, cityStateZip, notes], <br />)}
    </>
  );
};

export default ClientAddress;
