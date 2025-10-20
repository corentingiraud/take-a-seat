import { Moment } from "moment";

import { StrapiData } from "./utils/strapi-data";
import { Booking } from "./booking";
import { User } from "./user";
import { PaymentStatus } from "./payment-status";

import moment from "@/lib/moment";
import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { GeneralParams } from "@/types/strapi-api-params";

interface PrepaidCardInterface {
  id?: number;
  documentId?: string;
  name: string;
  validFrom?: Moment | null;
  expirationDate?: Moment | null;
  remainingBalance: number;
  paymentStatus: PaymentStatus;
  user?: User;
  bookings?: Booking[];
  createdAt?: Moment | null;
}

export type PrepaidCardStatus = "usable" | "upcoming" | "expired" | "unusable";

export class PrepaidCard implements StrapiData {
  id: number;
  documentId: string;
  name: string;
  validFrom?: Moment | null;
  expirationDate?: Moment | null;
  remainingBalance: number;
  paymentStatus: PaymentStatus;
  user?: User;
  bookings: Booking[];
  createdAt?: Moment | null;

  static contentType = "prepaid-cards";

  constructor({
    id = UNDEFINED_ID,
    documentId = UNDEFINED_DOCUMENT_ID,
    validFrom = null,
    expirationDate = null,
    name,
    remainingBalance,
    paymentStatus = PaymentStatus.PENDING,
    user,
    bookings = [],
    createdAt = null,
  }: PrepaidCardInterface) {
    this.id = id;
    this.documentId = documentId;
    this.name = name;
    this.validFrom = validFrom;
    this.expirationDate = expirationDate;
    this.remainingBalance = remainingBalance;
    this.user = user;
    this.bookings = bookings ?? [];
    this.paymentStatus = paymentStatus;
    this.createdAt = createdAt;
  }

  static fromJson(json: any): PrepaidCard {
    return new PrepaidCard({
      id: json.id ?? UNDEFINED_ID,
      documentId: json.documentId ?? UNDEFINED_DOCUMENT_ID,
      name: json.name,
      validFrom: moment(json.validFrom),
      expirationDate: moment(json.expirationDate),
      remainingBalance: json.remainingBalance ?? 0,
      paymentStatus: json.paymentStatus,
      user: json.user ?? null,
      bookings: json.bookings ?? [],
      createdAt: moment(json.createdAt),
    });
  }

  static buildCardName(user: User, month: Moment, hours: number) {
    const monthLabel = month.format("MMMM YYYY");
    const fullName = `${user.lastName} ${user.firstName}`.trim();

    return `${fullName} — ${monthLabel} — ${hours}h`;
  }

  static get strapiAPIParams(): GeneralParams<PrepaidCard> {
    return {
      contentType: this.contentType,
      factory: PrepaidCard.fromJson,
    };
  }

  toJson(): object {
    const json: any = {
      name: this.name,
      validFrom: this.validFrom?.format(),
      expirationDate: this.expirationDate?.format(),
      remainingBalance: this.remainingBalance,
      paymentStatus: this.paymentStatus,
    };

    if (this.user?.documentId) {
      json.user = this.user.documentId;
    }

    return json;
  }

  toString() {
    return `${this.name} (${this.remainingBalance}h restantes)`;
  }

  get status(): PrepaidCardStatus {
    const today = moment();

    if (this.expirationDate?.isBefore(today, "d")) {
      return "expired";
    }

    if (
      this.validFrom?.isSameOrBefore(today, "d") &&
      this.expirationDate?.isSameOrAfter(today, "d") &&
      this.paymentStatus === PaymentStatus.PAID
    ) {
      return "usable";
    }

    if (this.validFrom?.isAfter(today) && this.expirationDate?.isAfter(today)) {
      return "upcoming";
    }

    return "unusable";
  }
}
