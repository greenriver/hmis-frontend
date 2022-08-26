import { format, parseISO, differenceInYears } from 'date-fns';
import { startCase } from 'lodash-es';

import {
  ClientFieldsFragment,
  ClientNameFragment,
  EnrollmentFieldsFragment,
  EventFieldsFragment,
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

export const dob = (client: ClientFieldsFragment) => {
  if (!client.dob) return '';
  return parseAndFormatDate(client.dob);
};

export const age = (client: ClientFieldsFragment) => {
  if (!client.dob) return '';
  const date = parseISO(client.dob);
  return differenceInYears(new Date(), date);
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

export const humanizeEnum = (s: string) => startCase(s.toLowerCase());

export const eventReferralResult = (e: EventFieldsFragment) => {
  if (!e.referralResult) return null;
  const result = humanizeEnum(e.referralResult);
  if (e.resultDate) {
    return `${result} (${parseAndFormatDate(e.resultDate)})`;
  }
  return result;
};
