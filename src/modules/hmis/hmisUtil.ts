import {
  differenceInDays,
  differenceInYears,
  format,
  formatDistanceToNowStrict,
  isValid,
  parse,
  parseISO,
} from 'date-fns';
import { isNil, sortBy, startCase } from 'lodash-es';

import { HmisEnums } from '@/types/gqlEnums';
import { HmisObjectSchemas } from '@/types/gqlObjects';
import {
  ClientFieldsFragment,
  ClientNameFragment,
  EnrollmentFieldsFragment,
  EventFieldsFragment,
  HouseholdClientFieldsFragment,
  ProjectType,
  RecordType,
  RelationshipToHoH,
  ServiceFieldsFragment,
  ServiceTypeProvided,
} from '@/types/gqlTypes';

/**
 * Utility functions for transforming HMIS data elements into strings
 */

export const MISSING_DATA_KEYS = [
  'DATA_NOT_COLLECTED',
  'CLIENT_REFUSED',
  'CLIENT_DOESN_T_KNOW',
];

const DATE_DISPLAY_FORMAT = 'MM/dd/yyyy';
const HMIS_DATE_FORMAT = 'yyyy-MM-dd';
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const formatDateForGql = (date: Date) => {
  try {
    return format(date, HMIS_DATE_FORMAT);
  } catch (RangeError) {
    console.error(
      `Failed to format date '${date.toString()}' as ${HMIS_DATE_FORMAT}`
    );
    return null;
  }
};

export const formatDateForDisplay = (date: Date) => {
  try {
    return format(date, DATE_DISPLAY_FORMAT);
  } catch (RangeError) {
    console.error(
      `Failed to format date '${date.toString()}' as ${DATE_DISPLAY_FORMAT}`
    );
    return null;
  }
};

export const yesNo = (bool: boolean | null | undefined) => {
  if (isNil(bool)) return null;
  return bool ? 'Yes' : 'No';
};

// Prefix on descriptions, like "(8) Client doesn't know"
const numericPrefix = /^\([0-9]*\)\s/;

export const parseHmisDateString = (
  dateString: string | null | undefined
): Date | null => {
  if (isNil(dateString)) return null;
  // Check format first because parsing is too lenient
  // https://github.com/date-fns/date-fns/issues/942
  if (!dateString.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
    return null;
  }
  const date = parse(dateString, HMIS_DATE_FORMAT, new Date());
  return isValid(date) ? date : null;
};

export const parseHmisDateTimeString = (dateString: string): Date | null => {
  const date = parseISO(dateString);
  if (!isValid(date)) {
    console.error(`Failed to parse datetime: ${dateString}`);
    return null;
  }
  return date;
};

export const parseAndFormatDate = (dateString: string): string => {
  if (!dateString) return dateString;
  const parsed = parseHmisDateString(dateString);
  if (!parsed) return dateString;
  return formatDateForDisplay(parsed) || dateString;
};

export const parseAndFormatDateRange = (
  startDateString?: string | null,
  endDateString?: string | null,
  startPlaceholder = 'Unknown',
  endPlaceholder = 'Active'
): string | null => {
  if (!startDateString && !endDateString) return null;
  const start = startDateString ? parseHmisDateString(startDateString) : null;
  const end = endDateString ? parseHmisDateString(endDateString) : null;

  const startFormatted = start
    ? formatDateForDisplay(start)
    : startDateString || startPlaceholder;
  const endFormatted = end
    ? formatDateForDisplay(end)
    : endDateString || endPlaceholder;

  return `${startFormatted} - ${endFormatted}`;
};

export const parseAndFormatDateTime = (dateString: string): string => {
  if (!dateString) return dateString;
  const parsed = parseHmisDateTimeString(dateString);
  if (!parsed) return dateString;
  return formatDateForDisplay(parsed) || dateString;
};

export const formatRelativeDate = (date: Date): string => {
  return `${formatDistanceToNowStrict(date)} ago`;
};

export const formatCurrency = (number?: number) => {
  if (isNil(number)) return number;
  return currencyFormatter.format(number);
};

export const clientName = (client: ClientNameFragment) =>
  [client.preferredName || client.firstName, client.lastName]
    .filter(Boolean)
    .join(' ');

export const clientFullNameWithoutPreferred = (client: ClientNameFragment) =>
  [client.firstName, client.middleName, client.lastName, client.nameSuffix]
    .filter(Boolean)
    .join(' ');

export const clientFirstNameAndPreferred = (client: ClientNameFragment) => {
  if (client.preferredName && !client.firstName) return client.preferredName;
  if (!client.preferredName && client.firstName) return client.firstName;
  if (client.preferredName && client.firstName)
    return `${client.preferredName} (${client.firstName})`;
  return null;
};

export const clientInitials = (client: ClientNameFragment) =>
  [client.preferredName || client.firstName, client.lastName]
    .filter(Boolean)
    .map((s) => (s ? s[0] : ''))
    .join('');

export const dob = (client: ClientFieldsFragment) => {
  if (!client.dob) return '';
  return parseAndFormatDate(client.dob);
};

export const age = (client: ClientFieldsFragment) => {
  if (!client.dob) return '';
  const date = parseISO(client.dob);
  return differenceInYears(new Date(), date);
};

export const last4SSN = (client: ClientFieldsFragment) => {
  if (!client.ssn) return '';
  let end = client.ssn.slice(-4);
  if (end.length < 4) {
    end = [...Array(4 - end.length).fill('*'), end].join('');
  }
  return end;
};

export const maskedSSN = (client: ClientFieldsFragment) => {
  if (!client.ssn) return '';
  const lastFour = last4SSN(client);
  return `***-**-${lastFour}`;
};

export const lastUpdated = (client: ClientFieldsFragment) => {
  return parseAndFormatDateTime(client.dateUpdated);
};

export const pronouns = (client: ClientFieldsFragment): React.ReactNode =>
  client.pronouns ? client.pronouns.join(', ') : null;

export const entryExitRange = (enrollment: EnrollmentFieldsFragment) => {
  return parseAndFormatDateRange(enrollment.entryDate, enrollment.exitDate);
};

// Open, or closed within the last X days
export const isRecentEnrollment = (
  enrollment: EnrollmentFieldsFragment,
  withinDays = 30
) => {
  if (!enrollment.exitDate) return true;
  const exit = parseHmisDateString(enrollment.exitDate);
  if (!exit) return false;

  return differenceInDays(new Date(), exit) <= withinDays;
};

export const enrollmentName = (
  enrollment: {
    project: { projectName: string; projectType?: ProjectType | null };
  },
  includeType = false
) => {
  const projectName = enrollment.project?.projectName;
  if (!includeType) return projectName;

  let projectType = enrollment.project?.projectType as string | undefined;
  if (!projectType) return projectName;

  if (projectType.length > 3)
    projectType = startCase(projectType.toLowerCase());
  return `${projectName} (${projectType})`;
};

const trimNumericPrefix = (s: string) => s.replace(numericPrefix, '');

export const relationshipToHohForDisplay = (
  relationship?: RelationshipToHoH
) => {
  if (isNil(relationship)) return '';
  if (relationship === RelationshipToHoH.SelfHeadOfHousehold)
    return 'Self (HoH)';
  // if (relationship === RelationshipToHoH.DataNotCollected) return null;
  const description = HmisEnums.RelationshipToHoH[relationship];
  if (!description) return relationship;
  return trimNumericPrefix(description);
};

export const eventReferralResult = (e: EventFieldsFragment) => {
  if (!e.referralResult) return null;
  const result = HmisEnums.ReferralResult[e.referralResult];
  if (e.resultDate) {
    return `${result} (${parseAndFormatDate(e.resultDate)})`;
  }
  return result;
};

export const serviceDetails = (e: ServiceFieldsFragment): string[] => {
  let typeProvided: string | null =
    HmisEnums.ServiceTypeProvided[e.typeProvided];

  // Don't show bed night because it's redundant
  if (e.typeProvided === ServiceTypeProvided.BedNightBedNight)
    typeProvided = null;

  const isOtherSsvf =
    e.recordType === RecordType.SsvfService &&
    e.typeProvided ===
      ServiceTypeProvided.SsvfServiceOtherNonTfaSupportiveServiceApprovedByVa;
  const isOtherHudVash =
    e.recordType === RecordType.HudVashOthVoucherTracking &&
    e.typeProvided === ServiceTypeProvided.HudVashOthVoucherTrackingOther;
  const isOtherMovingOn =
    e.recordType === RecordType.C2MovingOnAssistanceProvided &&
    e.typeProvided ===
      ServiceTypeProvided.C2MovingOnAssistanceProvidedOtherPleaseSpecify;

  // Don't show 'other' if we have the other value
  if ((isOtherSsvf || isOtherHudVash) && e.otherTypeProvided)
    typeProvided = null;

  // Don't show 'other' if we have the other value
  if (isOtherMovingOn && e.movingOnOtherType) typeProvided = null;

  return [
    typeProvided,
    e.otherTypeProvided,
    e.movingOnOtherType,
    e.subTypeProvided
      ? HmisEnums.ServiceSubTypeProvided[e.subTypeProvided]
      : null,
  ].filter(
    (s) => s !== null && s !== '' && typeof s !== 'undefined'
  ) as string[];
};

export const sortHouseholdMembers = (
  members?: HouseholdClientFieldsFragment[]
) => sortBy(members || [], [(c) => c.client.lastName, (c) => c.client.id]);

export const getSchemaForType = (type: string) => {
  return HmisObjectSchemas.find((t: any) => t.name === type);
};
