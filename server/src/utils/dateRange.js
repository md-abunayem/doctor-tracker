export const buildDateRangeFilter = (from, to) => {
  if (!from && !to) {
    return undefined;
  }

  const range = {};
  if (from) {
    range.$gte = from;
  }
  if (to) {
    const endOfDay = new Date(to);
    endOfDay.setUTCHours(23, 59, 59, 999);
    range.$lte = endOfDay;
  }
  return range;
};
