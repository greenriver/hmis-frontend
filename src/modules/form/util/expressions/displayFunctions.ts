function formatDuration(minutes: number) {
  if (!minutes) return '0 minutes';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  let result = '';

  if (hours > 0) {
    result += `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  if (hours > 0 && remainingMinutes > 0) {
    result += ' and ';
  }

  if (remainingMinutes > 0) {
    result += `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  }

  return result || '0 minutes';
}

const displayFunctions = new Map();
displayFunctions.set('FORMAT_DURATION', formatDuration);
export default displayFunctions;
