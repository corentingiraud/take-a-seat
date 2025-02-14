import moment from "moment";

export const AVAILABLE_DURATION = {
  ONE_HOUR: moment.duration(1, "hours"),
  HALF_DAY: moment.duration(4, "hours"),
  DAY: moment.duration(1, "day"),
};
