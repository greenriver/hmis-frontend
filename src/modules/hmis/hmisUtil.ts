import { format, parseISO, differenceInYears } from 'date-fns';

import {
  ReferralResultEnum,
  ServiceSubTypeProvidedEnum,
  ServiceTypeProvidedEnum,
} from '@/types/gqlEnums';
import {
  ClientFieldsFragment,
  ClientNameFragment,
  EnrollmentFieldsFragment,
  EventFieldsFragment,
  ServiceFieldsFragment,
} from '@/types/gqlTypes';

/**
 * Utility functions for transforming HMIS data elements into strings
 */

const DATE_FORMAT = 'MM/dd/yyyy';

const formatDate = (date: Date) => format(date, DATE_FORMAT);

export const parseAndFormatDate = (date: string) => {
  if (!date) return date;
  try {
    return formatDate(parseISO(date));
  } catch (RangeError) {
    return date;
  }
};

export const clientName = (client: ClientNameFragment) =>
  [client.preferredName || client.firstName, client.lastName]
    .filter(Boolean)
    .join(' ');

export const clientFirstNameAndPreferred = (client: ClientNameFragment) => {
  if (client.preferredName && !client.firstName) return client.preferredName;
  if (!client.preferredName && client.firstName) return client.firstName;
  if (client.preferredName && client.firstName)
    return `${client.preferredName} (${client.firstName})`;
  return null;
};

export const dob = (client: ClientFieldsFragment) => {
  if (!client.dob) return '';
  return parseAndFormatDate(client.dob);
};

export const age = (client: ClientFieldsFragment) => {
  if (!client.dob) return '';
  const date = parseISO(client.dob);
  return differenceInYears(new Date(), date);
};

export const maskedSSN = (client: ClientFieldsFragment) => {
  if (!client.ssnSerial) return '';
  let end = client.ssnSerial.slice(-4);
  if (end.length < 4) {
    end = [...Array(4 - end.length).fill('*'), end].join('');
  }
  return `***-**-${end}`;
};

export const lastUpdated = (client: ClientFieldsFragment) => {
  return parseAndFormatDate(client.dateUpdated);
};

// TODO implement
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const pronouns = (_client: ClientFieldsFragment) => null;

export const entryExitRange = (enrollment: EnrollmentFieldsFragment) => {
  return `${
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    enrollment.entryDate ? parseAndFormatDate(enrollment.entryDate) : 'unknown'
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  } - ${
    enrollment.exitDate ? parseAndFormatDate(enrollment.exitDate) : 'active'
  }`;
};

export const enrollmentName = (enrollment: {
  project: { projectName: string };
}) => {
  return enrollment.project.projectName;
};

export const eventReferralResult = (e: EventFieldsFragment) => {
  if (!e.referralResult) return null;
  const result = ReferralResultEnum[e.referralResult];
  if (e.resultDate) {
    return `${result} (${parseAndFormatDate(e.resultDate)})`;
  }
  return result;
};

export const serviceDetails = (e: ServiceFieldsFragment): string[] => {
  let typeProvided: string | null = ServiceTypeProvidedEnum[e.typeProvided];

  // Don't show bed night because it's redundant
  if (e.typeProvided === 'BED_NIGHT__BED_NIGHT') typeProvided = null;

  const isOtherSsvf =
    e.recordType === 'SSVF_SERVICE' &&
    e.typeProvided ===
      'SSVF_SERVICE__OTHER_NON_TFA_SUPPORTIVE_SERVICE_APPROVED_BY_VA';
  const isOtherHudVash =
    e.recordType === 'HUD_VASH_OTH_VOUCHER_TRACKING' &&
    e.typeProvided === 'HUD_VASH_OTH_VOUCHER_TRACKING__OTHER';
  const isOtherMovingOn =
    e.recordType === 'C2_MOVING_ON_ASSISTANCE_PROVIDED' &&
    e.typeProvided ===
      'C2_MOVING_ON_ASSISTANCE_PROVIDED__OTHER_PLEASE_SPECIFY_';

  // Don't show 'other' if we have the other value
  if ((isOtherSsvf || isOtherHudVash) && e.otherTypeProvided)
    typeProvided = null;

  // Don't show 'other' if we have the other value
  if (isOtherMovingOn && e.movingOnOtherType) typeProvided = null;

  return [
    typeProvided,
    e.otherTypeProvided,
    e.movingOnOtherType,
    e.subTypeProvided ? ServiceSubTypeProvidedEnum[e.subTypeProvided] : null,
  ].filter(
    (s) => s !== null && s !== '' && typeof s !== 'undefined'
  ) as string[];
};
