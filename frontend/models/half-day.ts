import { Moment } from "moment";

export enum HalfDay {
  Morning = "Matinée",
  Afternoon = "Après-midi",
}

export interface HalfDaySelection {
  date: Moment;
  halfDay: HalfDay;
}
