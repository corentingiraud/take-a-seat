import { StrapiData } from "./utils/strapi-data";

import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { FetchAllParams } from "@/types/strapi-api-params";

interface CoworkingSpaceInterface {
  id?: number;
  documentId?: string;
  name: string;
}

export class CoworkingSpace implements StrapiData {
  id!: number;
  documentId!: string;
  name!: string;

  constructor({
    id = UNDEFINED_ID,
    documentId = UNDEFINED_DOCUMENT_ID,
    name,
  }: CoworkingSpaceInterface) {
    this.id = id;
    this.documentId = documentId;
    this.name = name;
  }

  static fromJson(json: any): CoworkingSpace {
    return new CoworkingSpace({
      id: json.id,
      documentId: json.documentId,
      name: json.name,
    });
  }

  static get fetchParams(): FetchAllParams<CoworkingSpace> {
    return {
      contentType: "coworking-spaces",
      factory: CoworkingSpace.fromJson,
    };
  }

  toJson() {
    return {};
  }
}
