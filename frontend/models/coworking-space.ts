import { Service } from "./service";
import { Unavailability } from "./unavailability";
import { StrapiData } from "./utils/strapi-data";

import moment from "@/lib/moment";
import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { GeneralParams } from "@/types/strapi-api-params";
import { Moment } from "moment";

interface CoworkingSpaceInterface {
  id?: number;
  documentId?: string;
  name: string;
  locationURL?: string;
  services?: Service[];
  unavailabilities?: Unavailability[];
  createdAt?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
}

export class CoworkingSpace implements StrapiData {
  id: number;
  documentId: string;
  name: string;
  locationURL: string;
  services: Service[];
  unavailabilities: Unavailability[];
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;

  static contentType = "coworking-spaces";

  constructor({
    id = UNDEFINED_ID,
    documentId = UNDEFINED_DOCUMENT_ID,
    name,
    locationURL = "",
    services = [],
    unavailabilities = [],
    createdAt = null,
    updatedAt = null,
    publishedAt = null,
  }: CoworkingSpaceInterface) {
    this.id = id;
    this.documentId = documentId;
    this.name = name;
    this.locationURL = locationURL;
    this.services = services;
    this.unavailabilities = unavailabilities;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.publishedAt = publishedAt;
  }

  static fromJson(json: any): CoworkingSpace {
    return new CoworkingSpace({
      id: json.id,
      documentId: json.documentId,
      name: json.name,
      locationURL: json.locationURL,
      services: json.services?.map((s: any) => Service.fromJson(s)) ?? [],
      unavailabilities:
        json.unavailabilities?.map((u: any) => Unavailability.fromJson(u)) ??
        [],
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
      publishedAt: json.publishedAt,
    });
  }

  static get strapiAPIParams(): GeneralParams<CoworkingSpace> {
    return {
      contentType: this.contentType,
      factory: CoworkingSpace.fromJson,
    };
  }

  toJson(): object {
    const json: any = {
      name: this.name,
      locationURL: this.locationURL,
    };

    if (this.services.length > 0) {
      json.services = this.services.map((s) => s.documentId);
    }

    if (this.unavailabilities.length > 0) {
      json.unavailabilities = this.unavailabilities.map((u) => u.documentId);
    }

    return json;
  }

  findUnavailabilityForDate(date: Moment): Unavailability | null {
    return (
      this.unavailabilities.find(
        (u) =>
          moment(u.startDate).isSameOrBefore(date, "day") &&
          moment(u.endDate).isSameOrAfter(date, "day"),
      ) ?? null
    );
  }

  findUnavailabilitiesForDateRange(
    start: Moment,
    end: Moment,
  ): Unavailability[] {
    if (!start || !end) return [];

    const rangeStart = start.isAfter(end) ? end.clone() : start.clone();
    const rangeEnd = start.isAfter(end) ? start.clone() : end.clone();

    return this.unavailabilities
      .filter((u) => {
        const uStart = moment(u.startDate);
        const uEnd = moment(u.endDate);

        return (
          uStart.isSameOrBefore(rangeEnd, "day") &&
          uEnd.isSameOrAfter(rangeStart, "day")
        );
      })
      .sort(
        (a, b) => moment(a.startDate).valueOf() - moment(b.startDate).valueOf(),
      );
  }
}
