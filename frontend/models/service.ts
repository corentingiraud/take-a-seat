import { Time } from "./time";

import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { FetchAllParams } from "@/types/strapi-api-params";

interface ServiceInterface {
  id?: number;
  documentId?: string;
  name: string;
  openingTime: Time;
  closingTime: Time;
  maximumBookingsPerHour: number;
  minimumBookingMinutes: number;
}

export class Service {
  id!: number;
  documentId!: string;
  name!: string;
  openingTime!: Time;
  closingTime!: Time;
  maximumBookingsPerHour!: number;
  minimumBookingMinutes!: number;

  constructor({
    id = UNDEFINED_ID,
    documentId = UNDEFINED_DOCUMENT_ID,
    name,
    openingTime,
    closingTime,
    maximumBookingsPerHour,
    minimumBookingMinutes,
  }: ServiceInterface) {
    this.id = id;
    this.documentId = documentId;
    this.name = name;
    this.openingTime = openingTime;
    this.closingTime = closingTime;
    this.maximumBookingsPerHour = maximumBookingsPerHour;
    this.minimumBookingMinutes = minimumBookingMinutes;
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
    });
  }

  static get fetchParams(): FetchAllParams<Service> {
    return {
      contentType: "services",
      factory: Service.fromJson,
    };
  }

  toJson() {
    return {};
  }

  getTimeSlot(): Time[] {
    let slots: Time[] = [];
    const currentTime = new Time(0, 0);

    currentTime.hour =
      this.openingTime.minute === 0
        ? this.openingTime.hour
        : this.openingTime.hour + 1;

    while (currentTime.hour < this.closingTime.hour) {
      slots.push(new Time(currentTime.hour, 0));
      currentTime.hour += 1;
    }

    return slots;
  }
}
