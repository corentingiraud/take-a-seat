import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type BookingSlot = {
  start: moment.Moment;
  end: moment.Moment;
};

export type TimeSlot = {
  start: string;
  end: string;
};

export type Day =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type WeeklySchedule = Partial<Record<Day, TimeSlot[]>>;
