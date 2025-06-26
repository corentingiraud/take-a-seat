import { Service } from "./service";
import { Unavailability } from "./unavailability";
import { StrapiData } from "./utils/strapi-data";

import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { GeneralParams } from "@/types/strapi-api-params";

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
}
