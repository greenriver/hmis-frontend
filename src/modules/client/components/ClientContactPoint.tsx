import { compact } from 'lodash-es';
import React from 'react';

import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { HmisEnums } from '@/types/gqlEnums';
import {
  ClientContactPointSystem,
  ClientContactPoint as GqlClientContactPoint,
} from '@/types/gqlTypes';
import { compactJoinNodes } from '@/utils/nodes';

interface Props {
  contactPoint: Pick<
    GqlClientContactPoint,
    'value' | 'system' | 'use' | 'notes'
  >;
}

export const formatPhone = (num: any) => {
  const match =
    String(num).match(/^(\(?(\d{3})\)?\s*)?(\d{3})\s*-?\s*(\d{4})/) || [];
  if (!match) {
    console.warn(`Could not format phone number '${num}'`);
    return num;
  }

  const [, , area, first3, last4] =
    String(num).match(/^(\(?(\d{3})\)?\s*)?(\d{3})\s*-?\s*(\d{4})/) || [];

  const base = [first3, last4].join('-');
  return compact([area ? `(${area})` : undefined, base]).join(' ');
};

const ClientContactPoint: React.FC<Props> = ({
  contactPoint: { value, system, use, notes },
}) => {
  let formattedValue = value;
  if (system === ClientContactPointSystem.Phone)
    formattedValue = formatPhone(value);

  return (
    <>
      {compactJoinNodes(
        [
          formattedValue,
          use ? (
            <HmisEnum
              value={use}
              enumMap={HmisEnums.ClientContactPointUse}
              sx={{ display: 'inline' }}
            />
          ) : undefined,
          notes,
        ],
        <br />
      )}
    </>
  );
};

export default ClientContactPoint;
