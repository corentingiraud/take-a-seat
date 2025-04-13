import { StrapiData } from "./utils/strapi-data";
import { Role } from "./role";

import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { FetchAllParams } from "@/types/strapi-api-params";

interface UserInterface {
  id?: number;
  documentId?: string;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
}

export class User implements StrapiData {
  id!: number;
  documentId!: string;
  username!: string;
  email!: string;
  confirmed!: boolean;
  blocked!: boolean;
  createdAt!: string;
  updatedAt!: string;
  firstName!: string;
  lastName!: string;
  phone!: string;
  role!: Role;

  constructor({
    id = UNDEFINED_ID,
    documentId = UNDEFINED_DOCUMENT_ID,
    username,
    email,
    confirmed,
    blocked,
    createdAt,
    updatedAt,
    firstName,
    lastName,
    phone,
    role,
  }: UserInterface) {
    this.id = id;
    this.documentId = documentId;
    this.username = username;
    this.email = email;
    this.confirmed = confirmed;
    this.blocked = blocked;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.role = role;
  }

  static fromJson(json: any): User {
    return new User({
      id: json.id,
      documentId: json.documentId,
      username: json.username,
      email: json.email,
      confirmed: json.confirmed,
      blocked: json.blocked,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
      firstName: json.firstName,
      lastName: json.lastName,
      phone: json.phone,
      role: Role.fromJson(json.role),
    });
  }

  static get fetchParams(): FetchAllParams<User> {
    return {
      contentType: "users",
      factory: User.fromJson,
    };
  }

  toJson() {
    return {};
  }
}
