import { DateTime } from "luxon";

export function buildUtcDateRange(
  startDate?: string,
  endDate?: string,
  userTz: string = "America/Santo_Domingo"
) {
  let range: { gte?: Date; lt?: Date } = {};

  if (startDate) {
    console.log("Start Date:", startDate);
    const start = DateTime.fromISO(startDate, { zone: userTz })
      .startOf("day")
      .toUTC();
    range.gte = start.toJSDate();
  }

  if (endDate) {
    const end = DateTime.fromISO(endDate, { zone: userTz })
      .plus({ days: 1 })
      .startOf("day")
      .toUTC();
    range.lt = end.toJSDate();
  }

  return range;
}
