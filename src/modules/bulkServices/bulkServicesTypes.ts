import { sub } from 'date-fns';

export type ServicePeriod = {
  start: Date;
  end: Date;
};

const today = new Date();
export const FixedServiceRanges: Record<string, ServicePeriod> = {
  Today: { start: today, end: today },
  Yesterday: { start: sub(today, { days: 1 }), end: sub(today, { days: 1 }) },
  LastWeek: { start: sub(today, { days: 7 }), end: today },
  LastTwoWeeks: { start: sub(today, { days: 14 }), end: today },
  LastMonth: { start: sub(today, { days: 30 }), end: today },
};

export type FixedRange = keyof typeof FixedServiceRanges;

export function isFixedRange(value: string): value is FixedRange {
  return !!value && Object.keys(FixedServiceRanges).includes(value);
}
