import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type DesiredBookingDates = {
  startDate: moment.Moment;
  endDate: moment.Moment;
}[];
