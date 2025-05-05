import { StrapiData } from "./utils/strapi-data";

import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { GeneralParams } from "@/types/strapi-api-params";

export enum RoleType {
  SUPER_ADMIN = "super_admin",
  COWORKER = "coworker",
}

interface RoleInterface {
  id?: number;
  documentId?: string;
  name: string;
  type: RoleType;
}

export class Role implements StrapiData {
  id!: number;
  documentId!: string;
  name!: string;
  type!: RoleType;

  static readonly contentType = "roles";

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

  static get strapiAPIParams(): GeneralParams<Role> {
    return {
      contentType: this.contentType,
      factory: Role.fromJson,
    };
  }

  toJson() {
    return {};
  }
}
