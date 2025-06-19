import moment, { Moment } from "moment";

import { StrapiData } from "./utils/strapi-data";
import { Booking } from "./booking";
import { User } from "./user";
import { PaymentStatus } from "./payment-status";

import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";
import { GeneralParams } from "@/types/strapi-api-params";

interface PrepaidCardInterface {
  id?: number;
  documentId?: string;
  validFrom?: Moment | null;
  expirationDate?: Moment | null;
  remainingBalance: number;
  paymentStatus: PaymentStatus;
  user?: User;
  bookings?: Booking[];
}

export type PrepaidCardStatus = "usable" | "upcoming" | "expired";

export class PrepaidCard implements StrapiData {
  id: number;
  documentId: string;
  validFrom?: Moment | null;
  expirationDate?: Moment | null;
  remainingBalance: number;
  paymentStatus: PaymentStatus;
  user?: User;
  bookings: Booking[];

  static contentType = "prepaid-cards";

  constructor({
    id = UNDEFINED_ID,
    documentId = UNDEFINED_DOCUMENT_ID,
    validFrom = null,
    expirationDate = null,
    remainingBalance,
    paymentStatus = PaymentStatus.PENDING,
    user,
    bookings = [],
  }: PrepaidCardInterface) {
    this.id = id;
    this.documentId = documentId;
    this.validFrom = validFrom;
    this.expirationDate = expirationDate;
    this.remainingBalance = remainingBalance;
    this.user = user;
    this.bookings = bookings ?? [];
    this.paymentStatus = paymentStatus;
  }

  static fromJson(json: any): PrepaidCard {
    return new PrepaidCard({
      id: json.id ?? UNDEFINED_ID,
      documentId: json.documentId ?? UNDEFINED_DOCUMENT_ID,
      validFrom: moment(json.validFrom),
      expirationDate: moment(json.expirationDate),
      remainingBalance: json.remainingBalance ?? 0,
      paymentStatus: json.paymentStatus,
      user: json.user ?? null,
      bookings: json.bookings ?? [],
    });
  }

  static get strapiAPIParams(): GeneralParams<PrepaidCard> {
    return {
      contentType: this.contentType,
      factory: PrepaidCard.fromJson,
    };
  }

  toJson(): object {
    const json: any = {
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
    return `Carte N°${this.id} (${this.remainingBalance} heures restantes)`;
  }

  get status(): PrepaidCardStatus {
    const today = moment();

    if (
      this.validFrom?.isSameOrBefore(today) &&
      this.expirationDate?.isAfter(today)
    ) {
      return "usable";
    }

    if (this.validFrom?.isAfter(today) && this.expirationDate?.isAfter(today)) {
      return "upcoming";
    }

    return "expired";
  }
}
