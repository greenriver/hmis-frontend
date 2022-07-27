import { format, parseISO, differenceInYears } from 'date-fns';

import { Client, Enrollment } from '@/types/gqlTypes';

/**
 * Utility functions for transforming HMIS data elements into strings
 */

const DATE_FORMAT = 'M/dd/yyyy';

const formatDate = (date: Date) => format(date, DATE_FORMAT);

export const name = (client: Client) =>
  [client.preferredName || client.firstName, client.lastName]
    .filter(Boolean)
    .join(' ');

export const dob = (client: Client) => {
  if (!client.dob) return '';
  return formatDate(parseISO(client.dob as string));
};

export const age = (client: Client) => {
  if (!client.dob) return '';
  const date = parseISO(client.dob as string);
  return differenceInYears(new Date(), date);
};

export const lastUpdated = (client: Client) => {
  const date = parseISO(client.dateUpdated as string);
  return formatDate(date);
};

export const entryExitRange = (enrollment: Enrollment) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `${enrollment.entryDate || 'unknown'} - ${
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    enrollment.exitDate || 'active'
  }`;
};
