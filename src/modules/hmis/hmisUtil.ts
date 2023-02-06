import {
  differenceInDays,
  differenceInYears,
  format,
  formatDistanceToNowStrict,
  isFuture,
  isToday,
  isValid,
  isYesterday,
  parseISO,
} from 'date-fns';
import { isNil, sortBy, startCase } from 'lodash-es';

import { HmisEnums } from '@/types/gqlEnums';
import { HmisObjectSchemas } from '@/types/gqlObjects';
import {
  AssessmentFieldsFragment,
  ClientFieldsFragment,
  ClientNameFragment,
  EnrollmentFieldsFragment,
  EventFieldsFragment,
  GetClientAssessmentsQuery,
  HouseholdClientFieldsFragment,
  HouseholdClientFieldsWithAssessmentsFragment,
  ProjectType,
  RecordType,
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

export const INVALID_ENUM = 'INVALID';

const DATE_DISPLAY_FORMAT = 'MM/dd/yyyy';
const DATETIME_DISPLAY_FORMAT = 'MM/dd/yyyy hh:mm a';
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

export const formatDateTimeForDisplay = (date: Date) => {
  try {
    return format(date, DATETIME_DISPLAY_FORMAT);
  } catch (RangeError) {
    console.error(
      `Failed to format date '${date.toString()}' as ${DATETIME_DISPLAY_FORMAT}`
    );
    return null;
  }
};

export const yesNo = (bool: boolean | null | undefined) => {
  if (isNil(bool)) return null;
  return bool ? 'Yes' : 'No';
};

export const parseHmisDateString = (
  dateString: string | null | undefined
): Date | null => {
  if (isNil(dateString)) return null;
  // Check format first because parsing is too lenient
  // https://github.com/date-fns/date-fns/issues/942
  // Matches date YYYY-MM-DD and ISO datetime
  if (!dateString.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}[A-Z+]?.*/)) {
    return null;
  }
  const date = parseISO(dateString);
  return isValid(date) ? date : null;
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
  const parsed = parseHmisDateString(dateString);
  if (!parsed) return dateString;
  return formatDateTimeForDisplay(parsed) || dateString;
};

export const formatRelativeDateTime = (date: Date): string => {
  const distance = formatDistanceToNowStrict(date);
  if (isFuture(date)) {
    return `In ${distance}`;
  }
  return `${distance} ago`;
};

export const formatRelativeDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return formatRelativeDateTime(date);
};

export const formatCurrency = (number?: number | null) => {
  if (isNil(number)) return number;
  return currencyFormatter.format(number);
};

export const clientNameWithoutPreferred = (
  client: ClientNameFragment,
  full = true
) => {
  const nameComponents = full
    ? [client.firstName, client.middleName, client.lastName, client.nameSuffix]
    : [client.firstName, client.lastName];
  return nameComponents.filter(Boolean).join(' ');
};

export const clientNameAllParts = (client: ClientNameFragment) => {
  return [
    client.preferredName,
    client.firstName,
    client.middleName,
    client.lastName,
    client.nameSuffix,
  ]
    .filter(Boolean)
    .join(' ');
};

export const clientBriefName = (client: ClientNameFragment) =>
  client.preferredName ||
  [client.firstName, client.lastName].filter(Boolean).join(' ');

export const clientInitials = (client: ClientNameFragment) =>
  [client.preferredName || client.firstName, client.lastName]
    .filter(Boolean)
    .map((s) => (s ? s[0] : ''))
    .join('');

export const dob = (client: { dob?: string | null }) => {
  if (!client.dob) return '';
  return parseAndFormatDate(client.dob);
};

export const age = (client: { dob?: string | null }) => {
  if (!client.dob) return '';
  const date = parseISO(client.dob);
  return differenceInYears(new Date(), date);
};

// export const last4SSN = (client: ClientFieldsFragment) => {
//   if (!client.ssn) return '';
//   let end = client.ssn.slice(-4);
//   if (end.length < 4) {
//     end = [...Array(4 - end.length).fill('*'), end].join('');
//   }
//   return end;
// };

export const maskSSN = (value?: string) => {
  if (!value) return null;
  let cleaned = value.replace(/[^\d|X|x]/g, '');

  // Trim if too long (shouldn't happen)
  if (cleaned.length > 9) {
    cleaned = cleaned.slice(-9);
  }
  // Fill if too short
  if (cleaned.length < 9) {
    cleaned = [...Array(9 - cleaned.length).fill('X'), cleaned].join('');
  }

  return cleaned.replace(/^(...)(.{2})(.{0,4}).*/, '$1-$2-$3');
};

export const lastUpdated = (
  client: ClientFieldsFragment,
  includeUser = false
) => {
  const str = parseAndFormatDateTime(client.dateUpdated);
  if (includeUser && client.user) {
    return `${str || 'unknown'} by ${client.user.name}`;
  }
  return str;
};

export const pronouns = (client: ClientFieldsFragment): React.ReactNode =>
  client.pronouns && client.pronouns.length > 0
    ? client.pronouns.join(', ')
    : null;

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

export const assessmentRoleDisplay = (assessment: AssessmentFieldsFragment) => {
  return startCase(assessment.assessmentDetail?.role?.toLowerCase());
};

export const assessmentDescription = (
  assessment: NonNullable<
    NonNullable<GetClientAssessmentsQuery['client']>['assessments']
  >['nodes'][0]
) => {
  return `${assessmentRoleDisplay(assessment)} assessment at ${enrollmentName(
    assessment.enrollment
  )} on ${parseAndFormatDate(assessment.assessmentDate) || 'unknown date'}`;
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
    e.typeProvided === ServiceTypeProvided.C2MovingOnAssistanceProvidedOther;

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
    formatCurrency(e.FAAmount),
    e.referralOutcome ? HmisEnums.PATHReferralOutcome[e.referralOutcome] : null,
  ].filter(
    (s) => s !== null && s !== '' && typeof s !== 'undefined'
  ) as string[];
};

export const sortHouseholdMembers = (
  members?:
    | HouseholdClientFieldsFragment[]
    | HouseholdClientFieldsWithAssessmentsFragment[],
  activeClientId?: string
) => {
  const sorted = sortBy(members || [], [
    (c) => (c.client.id === activeClientId ? -1 : 1),
    (c) => c.client.lastName,
    (c) => c.client.id,
  ]);
  return sorted;
};

export const getSchemaForType = (type: string) => {
  return HmisObjectSchemas.find((t: any) => t.name === type);
};

export const briefProjectType = (projectType: ProjectType) => {
  if (projectType.length > 3) {
    return startCase(projectType.toLowerCase());
  }
  return projectType;
};
