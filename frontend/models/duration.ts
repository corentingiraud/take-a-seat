import moment from "@/lib/moment";

type DurationType = "time" | "multipleDates" | "rangeOfDates";

export class DurationWrapper {
  private kind: DurationType;
  private duration: moment.Duration | null;

  private constructor(kind: DurationType, duration?: moment.Duration) {
    this.kind = kind;
    this.duration = duration || null;
  }

  equals(other: DurationWrapper): boolean {
    if (this.kind !== other.kind) return false;

    if (this.kind === "time") {
      return (
        this.duration!.asMilliseconds() === other.duration!.asMilliseconds()
      );
    }

    // For "multipleDates" and "rangeOfDates", just comparing kind is enough
    return true;
  }

  getDuration() {
    return this.duration;
  }

  get isSingleDay() {
    return this.kind === "time";
  }

  static halfHour() {
    return new DurationWrapper("time", moment.duration(30, "minutes"));
  }

  static oneHour() {
    return new DurationWrapper("time", moment.duration(1, "hours"));
  }

  static halfDay() {
    return new DurationWrapper("time", moment.duration(4, "hours"));
  }

  static multipleDates() {
    return new DurationWrapper("multipleDates");
  }

  static rangeOfDates() {
    return new DurationWrapper("rangeOfDates");
  }

  humanize(): string {
    if (this.kind === "multipleDates") return "un ou plusieurs jours";

    if (this.kind === "rangeOfDates") return "des jours consécutifs";

    if (this.kind && this.equals(AVAILABLE_DURATION.HALF_DAY))
      return "1/2 journée";

    return this.duration!.humanize();
  }
}

export const AVAILABLE_DURATION = {
  HALF_HOUR: DurationWrapper.halfHour(),
  ONE_HOUR: DurationWrapper.oneHour(),
  HALF_DAY: DurationWrapper.halfDay(),
  RANGE_OF_DATES: DurationWrapper.rangeOfDates(),
  MULTIPLE_DATES: DurationWrapper.multipleDates(),
};
