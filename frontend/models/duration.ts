import moment from "moment";

type DurationType = "fixed" | "days";

class DurationWrapper {
  private kind: DurationType;
  private duration: moment.Duration | null;

  private constructor(kind: DurationType, duration?: moment.Duration) {
    this.kind = kind;
    this.duration = duration || null;
  }

  getDuration() {
    return this.duration;
  }

  static oneHour() {
    return new DurationWrapper("fixed", moment.duration(1, "hours"));
  }

  static halfDay() {
    return new DurationWrapper("fixed", moment.duration(4, "hours"));
  }

  static days() {
    return new DurationWrapper("days");
  }

  humanize(): string {
    if (this.kind === "days") {
      return "un ou plusieurs jours";
    }

    return this.duration!.humanize(); // we know duration is defined for fixed
  }
}

export const AVAILABLE_DURATION = {
  ONE_HOUR: DurationWrapper.oneHour(),
  HALF_DAY: DurationWrapper.halfDay(),
  DAYS: DurationWrapper.days(),
};
