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
import { find, isNil, sortBy, startCase } from 'lodash-es';

import { hasMeaningfulValue } from '../form/util/formUtil';

import { HmisEnums } from '@/types/gqlEnums';
import { HmisInputObjectSchemas, HmisObjectSchemas } from '@/types/gqlObjects';
import {
  AssessmentFieldsFragment,
  ClientFieldsFragment,
  ClientNameFragment,
  CustomDataElementFieldsFragment,
  CustomDataElementValueFieldsFragment,
  EnrollmentFieldsFragment,
  EventFieldsFragment,
  GetClientAssessmentsQuery,
  HouseholdClientFieldsFragment,
  ProjectType,
  ServiceFieldsFragment,
  ServiceTypeFieldsFragment,
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

export const parseAndFormatDate = (
  dateString: string | null | undefined
): string | null => {
  if (!dateString) return null;
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

export const clientNameAllParts = (client: ClientNameFragment) => {
  return [
    client.firstName,
    client.middleName,
    client.lastName,
    client.nameSuffix,
  ]
    .filter(Boolean)
    .join(' ');
};

export const clientBriefName = (client: ClientNameFragment) =>
  [client.firstName, client.lastName].filter(Boolean).join(' ');

export const clientInitials = (client: ClientNameFragment) =>
  [client.firstName, client.lastName]
    .filter(Boolean)
    .map((s) => (s ? s[0] : ''))
    .join('');

export const dob = (client: { dob?: string | null }) => {
  if (!client.dob) return '';
  return parseAndFormatDate(client.dob);
};

export const age = (client: { dob?: string | null }) => {
  if (!client.dob) return null;
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

export const entryExitRange = (
  enrollment:
    | EnrollmentFieldsFragment
    | HouseholdClientFieldsFragment['enrollment'],
  endPlaceholder?: string
) => {
  return parseAndFormatDateRange(
    enrollment.entryDate,
    enrollment.exitDate,
    undefined,
    endPlaceholder
  );
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

const dataCollectionStageDisplay = {
  INVALID: null,
  PROJECT_ENTRY: 'Intake',
  UPDATE: 'Update',
  PROJECT_EXIT: 'Exit',
  ANNUAL_ASSESSMENT: 'Annual',
  POST_EXIT: 'Post-exit',
};
export const formRoleDisplay = (assessment: AssessmentFieldsFragment) => {
  if (!assessment.dataCollectionStage) return null;

  if (!(assessment.dataCollectionStage in dataCollectionStageDisplay)) {
    return null;
  }

  return dataCollectionStageDisplay[assessment.dataCollectionStage];
};

export const assessmentDescription = (
  assessment: NonNullable<
    NonNullable<GetClientAssessmentsQuery['client']>['assessments']
  >['nodes'][0]
) => {
  const prefix = formRoleDisplay(assessment);
  const name = prefix ? `${prefix} assessment` : 'Assessment';
  return `${name} at ${enrollmentName(assessment.enrollment)} on ${
    parseAndFormatDate(assessment.assessmentDate) || 'unknown date'
  }`;
};

export const eventReferralResult = (e: EventFieldsFragment) => {
  if (!e.referralResult) return null;
  const result = HmisEnums.ReferralResult[e.referralResult];
  if (e.resultDate) {
    return `${result} (${parseAndFormatDate(e.resultDate)})`;
  }
  return result;
};

export const sortHouseholdMembers = (
  members?: HouseholdClientFieldsFragment[],
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

export const getSchemaForInputType = (type: string) => {
  return HmisInputObjectSchemas.find((t: any) => t.name === type);
};

export const briefProjectType = (projectType: ProjectType) => {
  if (projectType.length > 3) {
    return startCase(projectType.toLowerCase());
  }
  return projectType;
};

const customDataElementValue = (
  val: CustomDataElementValueFieldsFragment
): any => {
  return [
    val.valueBoolean,
    val.valueDate,
    val.valueFloat,
    val.valueInteger,
    val.valueJson,
    val.valueString,
    val.valueText,
  ].filter((e) => !isNil(e))[0];
};

export const customDataElementValueForKey = (
  key: string,
  elements: CustomDataElementFieldsFragment[]
) => {
  const element = find(elements, { key: key });
  if (!element) return;

  if (element.value) {
    return customDataElementValue(element.value);
  } else if (element.values) {
    return element.values.map((val) => customDataElementValue(val));
  }
};

export const serviceTypeSummary = (st: ServiceTypeFieldsFragment) => {
  if (st.category == st.name) return st.name;
  return [st.category, st.name].join(': ');
};

export const serviceDetails = (service: ServiceFieldsFragment): string[] => {
  const detailRows = [
    service.otherTypeProvided,
    service.movingOnOtherType,
    service.subTypeProvided
      ? HmisEnums.ServiceSubTypeProvided[service.subTypeProvided]
      : null,
    formatCurrency(service.faAmount),
    parseAndFormatDateRange(
      service.faStartDate,
      service.faEndDate,
      'Unknown',
      'Unknown'
    ),
    service.referralOutcome
      ? HmisEnums.PATHReferralOutcome[service.referralOutcome]
      : null,
  ].filter((s) => hasMeaningfulValue(s)) as string[];

  if (service.customDataElements) {
    service.customDataElements.map((cde) => {
      if (cde.value) detailRows.push(customDataElementValue(cde.value));
      if (cde.values)
        return detailRows.push(
          cde.values
            .map((val) => customDataElementValue(val))
            .filter((s) => hasMeaningfulValue(s))
            .join(', ')
        );
    });
  }
  return detailRows;
};
