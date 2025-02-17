import moment, { Moment } from "moment";

import { BookingStatus } from "./booking-status";
import { PaymentStatus } from "./payment-status";
import { Service } from "./service";
import { User } from "./user";
import { StrapiData } from "./utils/strapi-data";

import { FetchAllParams } from "@/types/strapi-api-params";
import { UNDEFINED_DOCUMENT_ID, UNDEFINED_ID } from "@/config/constants";

interface BookingInterface {
  id?: number;
  documentId?: string;
  startDate: Moment;
  endDate: Moment;
  user?: User;
  service?: Service;
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

  constructor({
    id = UNDEFINED_ID,
    documentId = UNDEFINED_DOCUMENT_ID,
    startDate,
    endDate,
    bookingStatus = BookingStatus.PENDING,
    paymentStatus = PaymentStatus.PENDING,
    user,
    service,
  }: BookingInterface) {
    this.id = id;
    this.documentId = documentId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.bookingStatus = bookingStatus;
    this.paymentStatus = paymentStatus;
    this.user = user ?? null;
    this.service = service ?? null;
  }

  static fromJson(json: any): Booking {
    return new Booking({
      id: json.id,
      documentId: json.documentId,
      startDate: moment(json.startDate),
      endDate: moment(json.endDate),
      bookingStatus: json.bookingStatus,
      paymentStatus: json.paymentStatus,
      user: json.user,
      service: json.service,
    });
  }

  static get strapiAPIParams(): FetchAllParams<Booking> {
    return {
      contentType: "bookings",
      factory: Booking.fromJson,
    };
  }

  toJson(): object {
    const json: any = {
      startDate: this.startDate.format(),
      endDate: this.endDate.format(),
      bookingStatus: this.bookingStatus,
      paymentStatus: this.paymentStatus,
    };

    if (this.user?.id) {
      json.user = this.user.documentId;
    }

    if (this.service?.id) {
      json.service = this.service.documentId;
    }

    return json;
  }

  toString() {
    return `Le ${this.startDate.format("ddd D MMM")} de ${this.startDate.format("H")}h à ${this.endDate.format("H")}h`;
  }
}
