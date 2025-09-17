import { Moment } from "moment";

import { BookingStatus } from "./booking-status";
import { PaymentStatus } from "./payment-status";
import { Service } from "./service";
import { User } from "./user";
import { StrapiData } from "./utils/strapi-data";
import { PrepaidCard } from "./prepaid-card";

import moment from "@/lib/moment";
import { GeneralParams } from "@/types/strapi-api-params";
import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";

interface BookingInterface {
  id?: number;
  documentId?: string;
  startDate: Moment;
  endDate: Moment;
  user?: User | null;
  service?: Service | null;
  prepaidCard?: PrepaidCard | null;
  bookingStatus?: BookingStatus;
  paymentStatus?: PaymentStatus;
}

export class Booking implements StrapiData {
  id: number;
  documentId: string;
  startDate: Moment;
  endDate: Moment;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  user: User | null;
  service: Service | null;
  prepaidCard: PrepaidCard | null;

  static readonly contentType = "bookings";

  constructor({
    id = UNDEFINED_ID,
    documentId = UNDEFINED_DOCUMENT_ID,
    startDate,
    endDate,
    bookingStatus = BookingStatus.PENDING,
    paymentStatus = PaymentStatus.PENDING,
    user,
    service,
    prepaidCard,
  }: BookingInterface) {
    this.id = id;
    this.documentId = documentId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.bookingStatus = bookingStatus;
    this.paymentStatus = paymentStatus;
    this.user = user ?? null;
    this.service = service ?? null;
    this.prepaidCard = prepaidCard ?? null;
  }

  static fromJson(json: any): Booking {
    return new Booking({
      id: json.id,
      documentId: json.documentId,
      startDate: moment(json.startDate),
      endDate: moment(json.endDate),
      bookingStatus: json.bookingStatus,
      paymentStatus: json.paymentStatus,
      user: json.user ? User.fromJson(json.user) : undefined,
      service: json.service ? Service.fromJson(json.service) : undefined,
      prepaidCard: json.prepaidCard
        ? PrepaidCard.fromJson(json.prepaidCard)
        : undefined,
    });
  }

  static get strapiAPIParams(): GeneralParams<Booking> {
    return {
      contentType: this.contentType,
      factory: Booking.fromJson,
    };
  }

  get isCancelable(): boolean {
    return (
      (this.bookingStatus === BookingStatus.PENDING ||
        this.bookingStatus === BookingStatus.CONFIRMED) &&
      !this.isPast
    );
  }

  toJson(): object {
    const json: any = {
      startDate: this.startDate.format(),
      endDate: this.endDate.format(),
      bookingStatus: this.bookingStatus,
      paymentStatus: this.paymentStatus,
    };

    if (this.user?.documentId) {
      json.user = this.user.documentId;
    }

    if (this.service?.documentId) {
      json.service = this.service.documentId;
    }

    if (this.prepaidCard?.documentId) {
      json.prepaidCard = this.prepaidCard.documentId;
    }

    return json;
  }

  toString() {
    return `Le ${this.startDate.format("ddd D MMM [de] H[h]mm [à]")} ${this.endDate.format("H[h]mm")}`;
  }

  get isPast(): boolean {
    const now = moment();

    return (
      (this.bookingStatus === BookingStatus.CONFIRMED ||
        this.bookingStatus === BookingStatus.PENDING) &&
      this.endDate.isBefore(now)
    );
  }
}
