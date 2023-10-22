import { createMask } from 'imask';
import React from 'react';

import { phoneMaskOptions } from '@/components/elements/input/PhoneInput';
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
  if (!num) return null;

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
  contactPoint: { value, system, notes },
}) => {
  let formattedValue = value;
  if (system === ClientContactPointSystem.Phone) {
    formattedValue = formatPhone(value);
  }

  return <>{compactJoinNodes([formattedValue, notes], <br />)}</>;
};

export default ClientContactPoint;
