import { Time } from "./time";

import { FetchAllParams } from "@/types/fetch-params";

export class Service {
  id!: number;
  documentId!: string;
  name!: string;
  openingTime!: Time;
  closingTime!: Time;
  maximumBookingsPerHour!: number;
  minimumBookingMinutes!: number;

  constructor(
    id: number,
    documentId: string,
    name: string,
    openingTime: string,
    closingTime: string,
    maximumBookingsPerHour: number,
    minimumBookingMinutes: number,
  ) {
    this.id = id;
    this.documentId = documentId;
    this.name = name;
    this.openingTime = Time.fromString(openingTime);
    this.closingTime = Time.fromString(closingTime);
    this.maximumBookingsPerHour = maximumBookingsPerHour;
    this.minimumBookingMinutes = minimumBookingMinutes;
  }

  static fromJson(json: any): Service {
    return new Service(
      json.id,
      json.documentId,
      json.name,
      json.openingTime,
      json.closingTime,
      json.maximumBookingsPerHour,
      json.minimumBookingMinutes,
    );
  }

  static get fetchParams(): FetchAllParams<Service> {
    return {
      contentType: "services",
      factory: Service.fromJson,
    };
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
