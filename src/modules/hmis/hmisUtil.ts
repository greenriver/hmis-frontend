import { format, parseISO, differenceInYears } from 'date-fns';

import { Client, Enrollment } from '@/types/gqlTypes';

/**
 * Utility functions for transforming HMIS data elements into strings
 */

const DATE_FORMAT = 'MM/dd/yyyy';

const formatDate = (date: Date) => format(date, DATE_FORMAT);

const parseAndFormat = (date: string) => formatDate(parseISO(date));

export const name = (client: Client) =>
  [client.preferredName || client.firstName, client.lastName]
    .filter(Boolean)
    .join(' ');

export const dob = (client: Client) => {
  if (!client.dob) return '';
  return parseAndFormat(client.dob);
};

export const age = (client: Client) => {
  if (!client.dob) return '';
  const date = parseISO(client.dob);
  return differenceInYears(new Date(), date);
};

export const lastUpdated = (client: Client) => {
  return parseAndFormat(client.dateUpdated);
};

// TODO implement
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const pronouns = (_client: Client) => '(she/her)';

export const entryExitRange = (enrollment: Enrollment) => {
  return `${
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    enrollment.entryDate ? parseAndFormat(enrollment.entryDate) : 'unknown'
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  } - ${enrollment.exitDate ? parseAndFormat(enrollment.exitDate) : 'active'}`;
};
