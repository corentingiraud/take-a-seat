import { Moment } from "moment";

import { Time } from "./time";
import { CoworkingSpace } from "./coworking-space";
import { Availability } from "./availability";
import { Booking } from "./booking";

import moment from "@/lib/moment";
import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { GeneralParams } from "@/types/strapi-api-params";

interface ServiceInterface {
  id?: number;
  documentId?: string;
  name: string;
  description?: string;
  bookingDuration: number;
  coworkingSpace?: CoworkingSpace;
  availabilities?: Availability[];
  bookings?: Booking[];
  createdAt?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
}

export class Service {
  id: number;
  documentId: string;
  name: string;
  description: string;
  bookingDuration: number;
  coworkingSpace: CoworkingSpace | null;
  availabilities: Availability[];
  bookings: Booking[];
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;

  static readonly contentType = "services";

  constructor({
    id = UNDEFINED_ID,
    documentId = UNDEFINED_DOCUMENT_ID,
    name,
    description = "",
    bookingDuration,
    coworkingSpace,
    availabilities = [],
    bookings = [],
    createdAt = null,
    updatedAt = null,
    publishedAt = null,
  }: ServiceInterface) {
    this.id = id;
    this.documentId = documentId;
    this.name = name;
    this.description = description;
    this.bookingDuration = bookingDuration;
    this.coworkingSpace = coworkingSpace ?? null;
    this.availabilities = availabilities;
    this.bookings = bookings;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.publishedAt = publishedAt;
  }

  static fromJson(json: any): Service {
    const service = new Service({
      id: json.id,
      documentId: json.documentId,
      name: json.name,
      description: json.description,
      bookingDuration: json.bookingDuration,
      coworkingSpace: json.coworkingSpace
        ? CoworkingSpace.fromJson(json.coworkingSpace)
        : undefined,
      availabilities:
        json.availabilities?.map((a: any) => Availability.fromJson(a)) ?? [],
      bookings: json.bookings?.map((b: any) => Booking.fromJson(b)) ?? [],
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
      publishedAt: json.publishedAt,
    });

    if (service.bookings) {
      for (const booking of service.bookings) {
        booking.service = service;
      }
    }

    return service;
  }

  static get strapiAPIParams(): GeneralParams<Service> {
    return {
      contentType: this.contentType,
      factory: Service.fromJson,
    };
  }

  toJson(): object {
    const json: any = {
      name: this.name,
      description: this.description,
      bookingDuration: this.bookingDuration,
    };

    if (this.coworkingSpace?.id) {
      json.coworkingSpace = this.coworkingSpace.documentId;
    }

    return json;
  }

  getTimeSlot(date: Moment): Time[] {
    const slots: Time[] = [];

    const availability = this.findAvailabilityForDate(date);

    if (!availability) return [];

    const slotStart = availability.getStartTimeFor(date)!;
    const slotEnd = availability.getEndTimeFor(date)!;

    while (slotStart.isBefore(slotEnd)) {
      if (
        availability.includeSlot(
          slotStart,
          moment.duration(this.bookingDuration, "minutes"),
        )
      ) {
        slots.push(new Time(slotStart.hour(), slotStart.minute()));
      }

      slotStart.add(this.bookingDuration, "minutes");
    }

    return slots;
  }

  findAvailabilityForDate(date: Moment): Availability | null {
    return (
      this.availabilities.find(
        (av) =>
          moment(av.startDate).isSameOrBefore(date, "day") &&
          moment(av.endDate).isSameOrAfter(date, "day"),
      ) ?? null
    );
  }

  findAvailabilitiesForDateRange(start: Moment, end: Moment): Availability[] {
    if (!start || !end) return [];

    const rangeStart = start.isAfter(end) ? end.clone() : start.clone();
    const rangeEnd = start.isAfter(end) ? start.clone() : end.clone();

    return this.availabilities
      .filter((av) => {
        const avStart = moment(av.startDate);
        const avEnd = moment(av.endDate);

        return (
          avStart.isSameOrBefore(rangeEnd, "day") &&
          avEnd.isSameOrAfter(rangeStart, "day")
        );
      })
      .sort(
        (a, b) => moment(a.startDate).valueOf() - moment(b.startDate).valueOf(),
      );
  }
}
