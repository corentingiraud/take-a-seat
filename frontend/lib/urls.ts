import { siteConfig } from "@/config/site";
import { Moment } from "moment";

export function getCalendarHref(args: {
  coworkingSpaceId?: string;
  startDate?: Moment;
  endDate?: Moment;
}) {
  const params = new URLSearchParams();

  if (args.coworkingSpaceId)
    params.set("coworkingSpaceId", args.coworkingSpaceId);
  // same names/format as useWeekSelector, otherwise the week is ignored
  if (args.startDate) params.set("start", args.startDate.format("YYYY-MM-DD"));
  if (args.endDate) params.set("end", args.endDate.format("YYYY-MM-DD"));

  const query = params.toString();

  return query
    ? `${siteConfig.path.calendar.href}?${query}`
    : siteConfig.path.calendar.href;
}
