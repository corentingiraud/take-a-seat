import { StrapiData } from "./utils/strapi-data";
import { Role } from "./role";
import { Booking } from "./booking";

import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { GeneralParams } from "@/types/strapi-api-params";

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
  role?: Role;
  bookings?: Booking[];
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
  role?: Role;
  bookings?: Booking[];

  static readonly contentType = "users";

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
    bookings,
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
    this.bookings = bookings;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
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
      role: json.role ? Role.fromJson(json.role) : undefined,
      bookings: json.bookings ? json.bookings?.map(Booking.fromJson) : [],
    });
  }

  static get strapiAPIParams(): GeneralParams<User> {
    return {
      contentType: this.contentType,
      factory: User.fromJson,
    };
  }

  toJson() {
    return {};
  }

  static sortAlphabetically(list: User[]): User[] {
    return list.sort((a, b) => {
      const nameA = `${a.lastName?.toLowerCase() || ""} ${a.firstName?.toLowerCase() || ""}`;
      const nameB = `${b.lastName?.toLowerCase() || ""} ${b.firstName?.toLowerCase() || ""}`;

      return nameA.localeCompare(nameB);
    });
  }
}
