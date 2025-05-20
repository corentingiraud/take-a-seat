import { StrapiData } from "./utils/strapi-data";
import { Unavailability } from "./unavailability";

import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { GeneralParams } from "@/types/strapi-api-params";

interface CoworkingSpaceInterface {
  id?: number;
  documentId?: string;
  name: string;
  unavailabilities?: Unavailability[];
}

export class CoworkingSpace implements StrapiData {
  id!: number;
  documentId!: string;
  name!: string;
  unavailabilities!: Unavailability[];

  static contentType = "coworking-spaces";

  constructor({
    id = UNDEFINED_ID,
    documentId = UNDEFINED_DOCUMENT_ID,
    name,
    unavailabilities = [],
  }: CoworkingSpaceInterface) {
    this.id = id;
    this.documentId = documentId;
    this.name = name;
    this.unavailabilities = unavailabilities;
  }

  static fromJson(json: any): CoworkingSpace {
    return new CoworkingSpace({
      id: json.id,
      documentId: json.documentId,
      name: json.name,
      unavailabilities:
        json.unavailabilities?.map((u: any) => Unavailability.fromJson(u)) ??
        [],
    });
  }

  static get strapiAPIParams(): GeneralParams<CoworkingSpace> {
    return {
      contentType: this.contentType,
      factory: CoworkingSpace.fromJson,
    };
  }

  toJson() {
    return {};
  }
}
