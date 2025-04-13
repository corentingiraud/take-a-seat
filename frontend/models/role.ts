import { StrapiData } from "./utils/strapi-data";

import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { FetchAllParams } from "@/types/strapi-api-params";

export enum ROLE_TYPE {
  SUPER_ADMIN = "super_admin",
  COWORKER = "coworker",
}

interface RoleInterface {
  id?: number;
  documentId?: string;
  name: string;
  type: ROLE_TYPE;
}

export class Role implements StrapiData {
  id!: number;
  documentId!: string;
  name!: string;
  type!: ROLE_TYPE;

  constructor({
    id = UNDEFINED_ID,
    documentId = UNDEFINED_DOCUMENT_ID,
    name,
    type,
  }: RoleInterface) {
    this.id = id;
    this.documentId = documentId;
    this.name = name;
    this.type = type;
  }

  static fromJson(json: any): Role {
    return new Role({
      id: json.id,
      documentId: json.documentId,
      name: json.name,
      type: json.type,
    });
  }

  static get fetchParams(): FetchAllParams<Role> {
    return {
      contentType: "roles",
      factory: Role.fromJson,
    };
  }

  toJson() {
    return {};
  }
}
