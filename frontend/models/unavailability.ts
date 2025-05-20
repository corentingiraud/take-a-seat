import moment, { Moment } from "moment";

import { StrapiData } from "./utils/strapi-data";
import { CoworkingSpace } from "./coworking-space";

import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { GeneralParams } from "@/types/strapi-api-params";

interface UnavailabilityInterface {
  id?: number;
  documentId?: string;
  name: string;
  startDate: Moment;
  endDate: Moment;
  coworkingSpaces: CoworkingSpace[];
}

export class Unavailability implements StrapiData {
  id!: number;
  documentId!: string;
  name!: string;
  startDate!: Moment;
  endDate!: Moment;
  coworkingSpaces!: CoworkingSpace[];

  static contentType = "unavailabilities";

  constructor({
    id = UNDEFINED_ID,
    documentId = UNDEFINED_DOCUMENT_ID,
    name,
    startDate,
    endDate,
    coworkingSpaces,
  }: UnavailabilityInterface) {
    this.id = id;
    this.documentId = documentId;
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.coworkingSpaces = coworkingSpaces;
  }

  static fromJson(json: any): Unavailability {
    return new Unavailability({
      id: json.id,
      documentId: json.documentId,
      name: json.name,
      startDate: moment(json.startDate),
      endDate: moment(json.endDate),
      coworkingSpaces: (json.coworkingSpaces || []).map((cs: any) =>
        CoworkingSpace.fromJson(cs),
      ),
    });
  }

  static get strapiAPIParams(): GeneralParams<Unavailability> {
    return {
      contentType: this.contentType,
      factory: Unavailability.fromJson,
    };
  }

  toJson() {
    return {
      id: this.id,
      documentId: this.documentId,
      name: this.name,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      coworkingSpaces: this.coworkingSpaces.map((cs) => cs.toJson()),
    };
  }
}
