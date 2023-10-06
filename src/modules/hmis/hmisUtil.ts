import {
  differenceInDays,
  differenceInYears,
  format,
  formatDistanceToNowStrict,
  isDate,
  isFuture,
  isToday,
  isTomorrow,
  isValid,
  isYesterday,
  parseISO,
} from 'date-fns';
import { find, isNil, sortBy, startCase } from 'lodash-es';

import {
  ClientNameDobVeteranFields,
  hasMeaningfulValue,
} from '../form/util/formUtil';

import { DashboardEnrollment } from './types';
import { HmisEnums } from '@/types/gqlEnums';
import { HmisInputObjectSchemas, HmisObjectSchemas } from '@/types/gqlObjects';
import {
  AssessmentFieldsFragment,
  ClientEnrollmentFieldsFragment,
  ClientFieldsFragment,
  ClientNameFragment,
  CustomDataElementFieldsFragment,
  CustomDataElementValueFieldsFragment,
  DataCollectedAbout,
  DataCollectionFeatureFieldsFragment,
  EnrollmentFieldsFragment,
  EnrollmentOccurrencePointFieldsFragment,
  EnrollmentSummaryFieldsFragment,
  EventFieldsFragment,
  GetClientAssessmentsQuery,
  HouseholdClientFieldsFragment,
  NoYesMissing,
  NoYesReasonsForMissingData,
  OccurrencePointFormFieldsFragment,
  ProjectType,
  RelationshipToHoH,
  ServiceFieldsFragment,
  ServiceTypeFieldsFragment,
} from '@/types/gqlTypes';

/**
 * Utility functions for transforming HMIS data elements into strings
 */

export const MISSING_DATA_KEYS = [
  NoYesReasonsForMissingData.DataNotCollected,
  NoYesReasonsForMissingData.ClientPrefersNotToAnswer,
  NoYesReasonsForMissingData.ClientDoesnTKnow,
];

export const PERMANENT_HOUSING_PROJECT_TYPES = [
  ProjectType.PhPsh,
  ProjectType.PhPh,
  ProjectType.PhOph,
  ProjectType.PhRrh,
];

export const STREET_OUTREACH_SERVICES_ONLY = [ProjectType.Sso, ProjectType.So];

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

export const formatDateForDisplay = (date: Date, fmt = DATE_DISPLAY_FORMAT) => {
  try {
    return format(date, fmt);
  } catch (RangeError) {
    console.error(`Failed to format date '${date.toString()}' as ${fmt}`);
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

export const briefProjectType = (projectType: ProjectType) => {
  switch (projectType) {
    case ProjectType.DayShelter:
    case ProjectType.Other:
    case ProjectType.Invalid:
      return startCase(projectType.toLowerCase());
    case ProjectType.EsEntryExit:
      return 'ES - Entry/Exit';
    default:
      return projectType.replace('_', ' - ');
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

export const safeParseDateOrString = (maybeDate: any): Date | null => {
  if (isDate(maybeDate)) return maybeDate;
  if (typeof maybeDate === 'string') return parseHmisDateString(maybeDate);
  return null;
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
  if (isTomorrow(date)) return 'Tomorrow'; // avoid returning hours diff
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';

  return formatRelativeDateTime(date);
};

export const formatCurrency = (number?: number | null) => {
  if (isNil(number)) return number;
  return currencyFormatter.format(number);
};

export const anonymousClientName = (client: ClientNameFragment) =>
  `Client ${client.id || ''}`;

export const clientNameAllParts = (client: ClientNameFragment) => {
  return (
    [client.firstName, client.middleName, client.lastName, client.nameSuffix]
      .filter(Boolean)
      .join(' ') || anonymousClientName(client)
  );
};

export const clientBriefName = (client: ClientNameFragment) =>
  [client.firstName, client.lastName].filter(Boolean).join(' ') ||
  anonymousClientName(client);

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
  const str = client.dateUpdated
    ? parseAndFormatDateTime(client.dateUpdated)
    : null;
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
    | HouseholdClientFieldsFragment['enrollment']
    | EnrollmentSummaryFieldsFragment,
  endPlaceholder?: string
) => {
  return parseAndFormatDateRange(
    enrollment.entryDate,
    'exitDate' in enrollment ? enrollment.exitDate : undefined,
    undefined,
    endPlaceholder
  );
};

// Open, or closed within the last X days
export const isRecentEnrollment = (
  enrollment: EnrollmentFieldsFragment | ClientEnrollmentFieldsFragment,
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
  const projectType = enrollment.project?.projectType;
  if (!projectType) return projectName;

  return `${projectName} (${briefProjectType(projectType)})`;
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

export const customDataElementValue = (
  val?: CustomDataElementValueFieldsFragment | null,
  transform?: 'for_display' | 'for_input' | undefined
): any => {
  if (!val) return;
  let bool: any = val.valueBoolean;
  if (transform === 'for_display') {
    bool = yesNo(bool);
  }

  let date: any = val.valueDate;
  if (transform === 'for_display') {
    date = parseAndFormatDate(val.valueDate);
  } else if (transform === 'for_input') {
    date = parseHmisDateString(val.valueDate);
  }
  return [
    bool,
    date,
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

export const customDataElementValueAsString = (
  cde: CustomDataElementFieldsFragment
): string | undefined => {
  if (cde.value) return customDataElementValue(cde.value, 'for_display');
  if (cde.values) {
    return cde.values
      .map((val) => customDataElementValue(val, 'for_display'))
      .filter((s) => hasMeaningfulValue(s))
      .join(', ');
  }
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
    service.customDataElements.forEach((cde) => {
      const val = customDataElementValueAsString(cde);
      if (val) detailRows.push(val);
    });
  }
  return detailRows;
};

export const pathStatusString = (
  enrollment: EnrollmentOccurrencePointFieldsFragment
) => {
  if (
    !enrollment.clientEnrolledInPath ||
    enrollment.clientEnrolledInPath === NoYesMissing.DataNotCollected
  )
    return;

  const val = HmisEnums.NoYesMissing[enrollment.clientEnrolledInPath];
  const date = parseAndFormatDate(enrollment.dateOfPathStatus);
  if (!date) return val;
  return `${val} (${date})`;
};

export const evaluateDataCollectedAbout = (
  dataCollectedAbout: DataCollectedAbout,
  client: ClientNameDobVeteranFields,
  relationshipToHoH: RelationshipToHoH
) => {
  switch (dataCollectedAbout) {
    case DataCollectedAbout.AllClients:
      return true;
    case DataCollectedAbout.Hoh:
      return relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold;
    case DataCollectedAbout.HohAndAdults:
      const clientAge = age(client);
      return (
        relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold ||
        isNil(client.dob) ||
        (!isNil(clientAge) && clientAge >= 18)
      );
    case DataCollectedAbout.VeteranHoh:
      return (
        relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold &&
        client.veteranStatus === NoYesReasonsForMissingData.Yes
      );
    default:
      throw new Error(
        `Unable to evaluate Data Collected About: ${dataCollectedAbout}`
      );
  }
};

export const occurrencePointCollectedForEnrollment = (
  occurrencePoint: OccurrencePointFormFieldsFragment,
  enrollment: DashboardEnrollment
) => {
  return evaluateDataCollectedAbout(
    occurrencePoint.dataCollectedAbout,
    enrollment.client,
    enrollment.relationshipToHoH
  );
};

export const featureEnabledForEnrollment = (
  feature: DataCollectionFeatureFieldsFragment,
  client: ClientNameDobVeteranFields,
  relationshipToHoH: RelationshipToHoH
) => {
  return evaluateDataCollectedAbout(
    feature.dataCollectedAbout,
    client,
    relationshipToHoH
  );
};

export const relationshipToHohForDisplay = (
  relationship: RelationshipToHoH,
  hideDataNotCollectedAndInvalid: boolean
) => {
  if (
    hideDataNotCollectedAndInvalid &&
    (relationship === RelationshipToHoH.DataNotCollected ||
      relationship === RelationshipToHoH.Invalid)
  ) {
    return '';
  }

  if (relationship === RelationshipToHoH.SelfHeadOfHousehold) return 'HoH';

  return HmisEnums.RelationshipToHoH[relationship];
};
