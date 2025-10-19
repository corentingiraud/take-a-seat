import { Moment } from "moment";

export function getServiceCalendarHref(args: {
  coworkingSpaceId?: string;
  serviceId?: string;
  startDate?: Moment;
  endDate?: Moment;
}) {
  const params = new URLSearchParams();

  if (args.coworkingSpaceId)
    params.set("coworkingSpaceId", args.coworkingSpaceId);
  if (args.serviceId) params.set("serviceId", args.serviceId);
  if (args.startDate) params.set("startDate", args.startDate.toISOString());
  if (args.endDate) params.set("endDate", args.endDate.toISOString());

  const query = params.toString();

  return query ? `/service-calendar?${query}` : `/service-calendar`;
}
