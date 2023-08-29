import { createMask } from 'imask';
import React from 'react';

import { phoneMaskOptions } from '@/components/elements/input/PhoneInput';
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

const minExpectedMaskedPhoneLength = Math.min(
  ...phoneMaskOptions.mask.map((i) => i.mask.length)
);

export const formatPhone = (num: any) => {
  const mask = createMask(phoneMaskOptions);
  mask.value = num;

  // if value doesn't reach the min mask length, just display it raw.
  // this could occur if we have malformatted phone numbers, or strings.
  if (mask.value.length < minExpectedMaskedPhoneLength) {
    return num;
  } else {
    return mask.value;
  }
};

const ClientContactPoint: React.FC<Props> = ({
  contactPoint: { value, system, use, notes },
}) => {
  let formattedValue = value;
  if (system === ClientContactPointSystem.Phone) {
    formattedValue = formatPhone(value);
  }

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
