import moment, { Moment } from "moment";

import { Time } from "./time";
import { CoworkingSpace } from "./coworking-space";

import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { GeneralParams } from "@/types/strapi-api-params";
import { MINIMUM_BOOKING_DURATION } from "@/config/site";

interface ServiceInterface {
  id?: number;
  documentId?: string;
  name: string;
  openingTime: Time;
  closingTime: Time;
  maximumBookingsPerHour: number;
  minimumBookingMinutes: number;
  coworkingSpace?: CoworkingSpace;
}

export class Service {
  id: number;
  documentId: string;
  name: string;
  openingTime: Time;
  closingTime: Time;
  maximumBookingsPerHour: number;
  minimumBookingMinutes: number;
  coworkingSpace: CoworkingSpace | null;

  static readonly contentType = "services";

  constructor({
    id = UNDEFINED_ID,
    documentId = UNDEFINED_DOCUMENT_ID,
    name,
    openingTime,
    closingTime,
    maximumBookingsPerHour,
    minimumBookingMinutes,
    coworkingSpace,
  }: ServiceInterface) {
    this.id = id;
    this.documentId = documentId;
    this.name = name;
    this.openingTime = openingTime;
    this.closingTime = closingTime;
    this.maximumBookingsPerHour = maximumBookingsPerHour;
    this.minimumBookingMinutes = minimumBookingMinutes;
    this.coworkingSpace = coworkingSpace ?? null;
  }

  static fromJson(json: any): Service {
    return new Service({
      id: json.id,
      documentId: json.documentId,
      name: json.name,
      openingTime: Time.fromString(json.openingTime),
      closingTime: Time.fromString(json.closingTime),
      maximumBookingsPerHour: json.maximumBookingsPerHour,
      minimumBookingMinutes: json.minimumBookingMinutes,
      coworkingSpace: json.coworkingSpace
        ? CoworkingSpace.fromJson(json.coworkingSpace)
        : undefined,
    });
  }

  static get strapiAPIParams(): GeneralParams<Service> {
    return {
      contentType: this.contentType,
      factory: Service.fromJson,
    };
  }

  toJson() {
    return {};
  }

  getTimeSlot(date: Moment): Time[] {
    const unavailabilities = this.coworkingSpace?.unavailabilities ?? [];
    const slots: Time[] = [];

    const now = moment(); // current real time
    const isToday = date.isSame(now, "day");

    const current = date.clone();

    if (isToday) {
      // Start from the next full hour
      const nextHour = now.clone().add(1, "hour").startOf("hour");

      current.hour(Math.max(this.openingTime.hour, nextHour.hour()));
      current.minute(nextHour.minute());
    } else {
      // Use coworking opening time
      current.hour(this.openingTime.hour).minute(this.openingTime.minute);
    }

    current.second(0);

    const endOfDay = date
      .clone()
      .hour(this.closingTime.hour)
      .minute(this.closingTime.minute)
      .second(0);

    while (current.isBefore(endOfDay)) {
      const slotStart = current.clone();
      const slotEnd = slotStart.clone().add(MINIMUM_BOOKING_DURATION);

      const overlaps = unavailabilities.some((unav) => {
        return (
          slotEnd.isAfter(unav.startDate) && slotStart.isBefore(unav.endDate)
        );
      });

      if (!overlaps) {
        slots.push(new Time(slotStart.hour(), slotStart.minute()));
      }

      current.add(MINIMUM_BOOKING_DURATION);
    }

    return slots;
  }
}
