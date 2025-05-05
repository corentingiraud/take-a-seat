import { StrapiData } from "./utils/strapi-data";

import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { GeneralParams } from "@/types/strapi-api-params";

interface CoworkingSpaceInterface {
  id?: number;
  documentId?: string;
  name: string;
}

export class CoworkingSpace implements StrapiData {
  id!: number;
  documentId!: string;
  name!: string;

  static contentType = "coworking-spaces";

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
