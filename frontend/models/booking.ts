import moment, { Moment } from "moment";

import { BookingStatus } from "./booking-status";
import { PaymentStatus } from "./payment-status";
import { Service } from "./service";
import { User } from "./user";
import { StrapiData } from "./utils/strapi-data";

import { FetchAllParams } from "@/types/fetch-params";
import { UNDEFINED_ID } from "@/config/constants";

interface BookingInterface {
  id?: number;
  startDate: Moment;
  endDate: Moment;
  user?: User;
  service?: Service;
  bookingStatus?: BookingStatus;
  paymentStatus?: PaymentStatus;
}

export class Booking implements StrapiData {
  id: number;
  startDate: Moment;
  endDate: Moment;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  user: User | null;
  service: Service | null;

  constructor({
    id = UNDEFINED_ID,
    startDate,
    endDate,
    bookingStatus = BookingStatus.PENDING,
    paymentStatus = PaymentStatus.PENDING,
    user,
    service,
  }: BookingInterface) {
    this.id = id;
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
      startDate: moment(json.startDate),
      endDate: moment(json.endDate),
      bookingStatus: json.bookingStatus,
      paymentStatus: json.paymentStatus,
      user: json.user,
      service: json.service,
    });
  }

  static get fetchParams(): FetchAllParams<Booking> {
    return {
      contentType: "bookings",
      factory: Booking.fromJson,
    };
  }

  toString() {
    return `Le ${this.startDate.format("ddd D MMM")} de ${this.startDate.format("H")}h à ${this.endDate.format("H")}h`;
  }
}
