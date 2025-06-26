import moment, { Duration, Moment } from "moment";

import { Service } from "./service";
import { Time } from "./time";

import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { GeneralParams } from "@/types/strapi-api-params";
import { BookingSlot, Day, TimeSlot, WeeklySchedule } from "@/types";

interface AvailabilityInterface {
  id?: number;
  documentId?: string;
  startDate: Moment | string;
  endDate: Moment | string;
  service?: Service;
  weeklyAvailabilities?: WeeklySchedule;
  numberOfSeats: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
}

export class Availability {
  id: number;
  documentId: string;
  startDate: Moment;
  endDate: Moment;
  service: Service | null;
  weeklyAvailabilities: WeeklySchedule;
  numberOfSeats: number;
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;

  static readonly contentType = "availabilities";

  constructor({
    id = UNDEFINED_ID,
    documentId = UNDEFINED_DOCUMENT_ID,
    startDate,
    endDate,
    service,
    weeklyAvailabilities = {},
    numberOfSeats,
    createdAt = null,
    updatedAt = null,
    publishedAt = null,
  }: AvailabilityInterface) {
    this.id = id;
    this.documentId = documentId;
    this.startDate = moment(startDate);
    this.endDate = moment(endDate);
    this.service = service ?? null;
    this.weeklyAvailabilities = weeklyAvailabilities;
    this.numberOfSeats = numberOfSeats;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.publishedAt = publishedAt;
  }

  static fromJson(json: any): Availability {
    return new Availability({
      id: json.id,
      documentId: json.documentId,
      startDate: json.startDate,
      endDate: json.endDate,
      service: json.service ? Service.fromJson(json.service) : undefined,
      weeklyAvailabilities: json.weeklyAvailabilities,
      numberOfSeats: json.numberOfSeats,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
      publishedAt: json.publishedAt,
    });
  }

  static get strapiAPIParams(): GeneralParams<Availability> {
    return {
      contentType: this.contentType,
      factory: Availability.fromJson,
    };
  }

  toJson(): object {
    const json: any = {
      startDate: this.startDate.format(),
      endDate: this.endDate.format(),
      numberOfSeats: this.numberOfSeats,
      weeklyAvailabilities: this.weeklyAvailabilities,
    };

    if (this.service?.id) {
      json.service = this.service.documentId;
    }

    return json;
  }

  includeSlot(date: Moment, duration: Duration): boolean {
    if (
      !this.includeInOverallAvailabilityRange(date) ||
      !this.includeInOverallAvailabilityRange(date.clone().add(duration))
    ) {
      return false;
    }

    const dailySlots = this.getDailySlots(date);

    if (!dailySlots || dailySlots.length === 0) return false;

    return dailySlots.some((slot: { start: string; end: string }) => {
      const slotStart = moment(date.format("YYYY-MM-DD") + "T" + slot.start);
      const slotEnd = moment(date.format("YYYY-MM-DD") + "T" + slot.end);

      const slotDurationEnd = date.clone().add(duration);

      return (
        date.isSameOrAfter(slotStart) && slotDurationEnd.isSameOrBefore(slotEnd)
      );
    });
  }

  includeInOverallAvailabilityRange(date: Moment): boolean {
    return (
      date.isSameOrAfter(this.startDate) && date.isSameOrBefore(this.endDate)
    );
  }

  getStartTimeFor(date: Moment): Moment | null {
    if (!this.includeInOverallAvailabilityRange(date)) return null;

    const dailySlots = this.getDailySlots(date);

    if (dailySlots.length === 0) return null;

    const startTime = Time.fromString(dailySlots[0].start);

    return date
      .clone()
      .startOf("day")
      .hour(startTime.hour)
      .minute(startTime.minute);
  }

  getEndTimeFor(date: Moment): Moment | null {
    if (!this.includeInOverallAvailabilityRange(date)) return null;

    const dailySlots = this.getDailySlots(date);

    if (dailySlots.length === 0) return null;

    const endTime = Time.fromString(dailySlots[dailySlots.length - 1].end);

    return date
      .clone()
      .startOf("day")
      .hour(endTime.hour)
      .minute(endTime.minute);
  }

  get earliestOpeningOfWeek(): Time | null {
    let earliest: Time | null = null;

    for (const day in this.weeklyAvailabilities) {
      const slots = this.weeklyAvailabilities[day as Day];

      if (!slots) continue;

      for (const slot of slots) {
        const currentTime = Time.fromString(slot.start);

        if (
          !earliest ||
          currentTime.hour < earliest.hour ||
          (currentTime.hour === earliest.hour &&
            currentTime.minute < earliest.minute)
        ) {
          earliest = currentTime;
        }
      }
    }

    return earliest;
  }

  get latestClosingOfTheWeek(): Time | null {
    let latest: Time | null = null;

    for (const day in this.weeklyAvailabilities) {
      const slots = this.weeklyAvailabilities[day as Day];

      if (!slots) continue;

      for (const slot of slots) {
        const endTime = Time.fromString(slot.end);

        if (
          !latest ||
          endTime.hour > latest.hour ||
          (endTime.hour === latest.hour && endTime.minute > latest.minute)
        ) {
          latest = endTime;
        }
      }
    }

    return latest;
  }

  getBookingSlotsFor(date: Moment): BookingSlot[] {
    const dailySlots = this.getDailySlots(date);

    return dailySlots.map((slot) => {
      const startTime = Time.fromString(slot.start);
      const endTime = Time.fromString(slot.end);

      return {
        start: date
          .clone()
          .startOf("day")
          .hour(startTime.hour)
          .minute(startTime.minute),
        end: date
          .clone()
          .startOf("day")
          .hour(endTime.hour)
          .minute(endTime.minute),
      };
    });
  }

  private getDailySlots(date: Moment): TimeSlot[] {
    const dayOfWeek = date.locale("en").format("dddd").toLowerCase() as Day;

    return this.weeklyAvailabilities?.[dayOfWeek] ?? [];
  }
}
