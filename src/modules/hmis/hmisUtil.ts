import {
  addMinutes,
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
  startOfDay,
} from 'date-fns';
import { capitalize, find, isNil, sortBy, startCase } from 'lodash-es';

import { ClientAssessmentType } from '../assessments/assessmentTypes';
import {
  ClientNameDobVeteranFields,
  hasMeaningfulValue,
} from '../form/util/formUtil';

import { DashboardEnrollment } from './types';

import { ColumnDef } from '@/components/elements/table/types';
import { HmisEnums } from '@/types/gqlEnums';
import { HmisInputObjectSchemas, HmisObjectSchemas } from '@/types/gqlObjects';
import {
  AssessmentFieldsFragment,
  AssessmentRole,
  AuditEventType,
  ClientEnrollmentFieldsFragment,
  ClientFieldsFragment,
  ClientImageFieldsFragment,
  ClientNameDobVetFragment,
  ClientNameFragment,
  CustomDataElementFieldsFragment,
  CustomDataElementValueFieldsFragment,
  DataCollectedAbout,
  DataCollectionFeatureFieldsFragment,
  DisplayHook,
  EnrollmentFieldsFragment,
  EnrollmentOccurrencePointFieldsFragment,
  EnrollmentSummaryFieldsFragment,
  EventFieldsFragment,
  HouseholdClientFieldsFragment,
  NoYes,
  NoYesMissing,
  NoYesReasonsForMissingData,
  OccurrencePointFormFieldsFragment,
  ProjectType,
  Race,
  RelationshipToHoH,
  ServiceFieldsFragment,
  ServiceTypeFieldsFragment,
  UserFieldsFragment,
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

// "Time of day" is stored as minutes since midnight
export const formatTimeOfDay = (timeOfDayMinutes: number) => {
  if (isNaN(Number(timeOfDayMinutes))) {
    return timeOfDayMinutes;
  }
  const midnight = startOfDay(new Date());
  const date = addMinutes(midnight, timeOfDayMinutes);
  return format(date, 'h:mm a'); // 6:30 am
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

export const yesNo = (
  bool: boolean | NoYes | null | undefined,
  fallback?: string
) => {
  if (isNil(bool)) return fallback || null;
  switch (bool) {
    case NoYes.Yes:
    case true:
      return 'Yes';
    case NoYes.No:
    case false:
      return 'No';
    case NoYes.Invalid:
      return 'Invalid Value';
    default:
      return fallback || null;
  }
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
  // remove time from ISO8601 date-time string
  dateString = dateString.slice(0, 10);

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

export const clientBriefName = (
  client: ClientNameFragment | ClientNameDobVetFragment
) =>
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

export const lastUpdatedBy = (
  dateUpdated?: string | null,
  user?: UserFieldsFragment | null
) => {
  const dateString = dateUpdated
    ? parseAndFormatDateTime(dateUpdated)
    : undefined;

  if (user) {
    return `${dateString || 'Unknown date'} by ${user.name}`;
  }

  return dateString;
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
  const defaultTitle = assessment.definition.title;
  if (assessment.role === AssessmentRole.CustomAssessment) {
    return defaultTitle;
  }
  if (assessment.dataCollectionStage) {
    return (
      dataCollectionStageDisplay[assessment.dataCollectionStage] || defaultTitle
    );
  }
  return defaultTitle;
};

export const assessmentDescription = (assessment: ClientAssessmentType) => {
  const prefix = formRoleDisplay(assessment);
  const name = prefix ? `${prefix} assessment` : 'Assessment';
  return `${name} at ${assessment.enrollment.projectName} on ${
    parseAndFormatDate(assessment.assessmentDate) || 'unknown date'
  }`;
};

export const eventReferralResult = (e: EventFieldsFragment) => {
  if (e.probSolDivRrResult) {
    if (e.probSolDivRrResult === NoYesMissing.Yes) {
      return 'Client housed/re-housed in a safe alternative';
    }
    if (e.probSolDivRrResult === NoYesMissing.No) {
      return 'Client not housed/re-housed';
    }
  }

  if (e.referralCaseManageAfter) {
    if (e.referralCaseManageAfter === NoYesMissing.Yes) {
      return 'Client enrolled in aftercare project';
    }
    if (e.referralCaseManageAfter === NoYesMissing.No) {
      return 'Client not enrolled in aftercare project';
    }
  }

  if (!e.referralResult) return null;
  const result = HmisEnums.ReferralResult[e.referralResult];
  if (e.resultDate) {
    return `${result} (${parseAndFormatDate(e.resultDate)})`;
  }
  return result;
};

export const sortHouseholdMembers = (
  members?: HouseholdClientFieldsFragment[],
  activeEnrollmentId?: string
) => {
  const sorted = sortBy(members || [], [
    (c) => (c.enrollment.id === activeEnrollmentId ? -1 : 1),
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
  if (st.categoryRecord.name === st.name) return st.name;
  return [st.categoryRecord.name, st.name].join(': ');
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
  // Details about HUD Services
  const detailRows = [
    service.otherTypeProvided,
    service.movingOnOtherType,
    service.subTypeProvided
      ? HmisEnums.ServiceSubTypeProvided[service.subTypeProvided]
      : null,
    formatCurrency(service.faAmount),
    service.referralOutcome
      ? HmisEnums.PATHReferralOutcome[service.referralOutcome]
      : null,
  ].filter((s) => hasMeaningfulValue(s)) as string[];

  // Details about custom fields
  service.customDataElements
    .filter((cde) => cde.displayHooks.includes(DisplayHook.TableSummary))
    .forEach((cde) => {
      const val = customDataElementValueAsString(cde);
      if (val) detailRows.push(`${cde.label}: ${val}`);
    });

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
    case DataCollectedAbout.AllVeterans:
      return client.veteranStatus === NoYesReasonsForMissingData.Yes;
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

export const auditActionForDisplay = (action: AuditEventType) => {
  if (action === AuditEventType.Destroy) {
    return 'Delete';
  }
  return capitalize(action);
};

export const dataUrlForClientImage = (
  image: ClientImageFieldsFragment
): string | undefined => {
  if (!image?.base64) return;

  return `data:image/jpeg;base64,${image.base64}`;
};

// Construct ColumnDefs based on which summary-level CustomDataElements
// are present on the records.
//services
export function getCustomDataElementColumns<
  RowType extends { customDataElements: CustomDataElementFieldsFragment[] },
>(rows: RowType[]) {
  if (!rows || rows.length === 0) return [];

  function generateColumnDefinition(cded: CustomDataElementFieldsFragment) {
    return {
      header: cded.label,
      key: cded.key,
      render: (row: RowType) => {
        const thisCde = row.customDataElements.find(
          (elem) => elem.key === cded.key
        );
        if (!thisCde) return null;
        return customDataElementValueAsString(thisCde);
      },
    };
  }

  const columnsByKey: Record<string, ColumnDef<RowType>> = {};
  rows.forEach((row) => {
    row.customDataElements.forEach((cded) => {
      if (!cded.displayHooks.includes(DisplayHook.TableSummary)) return;
      if (columnsByKey[cded.key]) return; // seen

      columnsByKey[cded.key] = generateColumnDefinition(cded);
    });
  });

  // sort columns by CDED Key so they always appear in the same order
  return Object.keys(columnsByKey)
    .sort()
    .map((key) => columnsByKey[key]);
}

export const raceEthnicityDisplayString = (race?: Race[]) => {
  if (!race) return;

  return race.map((r) => HmisEnums.Race[r]).join(', ');
};
