import formatDuration from 'date-fns/formatDuration';

import { parseNumber } from '@/utils/numbers';

export function formatDurationMinutes(arg: number | string) {
  const total = parseNumber(arg);
  if (total === undefined) return undefined;

  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  return formatDuration({ hours, minutes });
}

const displayFunctions = new Map();
displayFunctions.set('FORMAT_DURATION', formatDurationMinutes);
// functions to expose in a display expression
export default displayFunctions;
