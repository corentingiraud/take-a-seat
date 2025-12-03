export class Time {
  hour!: number;
  minute!: number;

  constructor(hour: number, minute: number) {
    this.hour = hour;
    this.minute = minute;
  }

  static fromString(value: string) {
    let separator = ":";

    if (value.includes("h")) separator = "h";

    const hour = parseInt(value.split(separator)[0]);
    const minute = parseInt(value.split(separator)[1]);

    return new Time(hour, minute);
  }

  toString(): string {
    return `${this.hour.toString().padStart(2, "0")}h${this.minute.toString().padStart(2, "0")}`;
  }

  toISOString(): string {
    return `${this.hour.toString().padStart(2, "0")}:${this.minute.toString().padStart(2, "0")}`;
  }

  equals(other: Time): boolean {
    return this.hour === other.hour && this.minute === other.minute;
  }

  addMinutes(minutesToAdd: number): Time {
    let totalMinutes = this.hour * 60 + this.minute + minutesToAdd;

    totalMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);

    const newHour = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;

    return new Time(newHour, newMinute);
  }

  isBefore(other: Time): boolean {
    if (this.hour < other.hour) return true;

    if (this.hour === other.hour)
      return this.minute < other.minute;

    return false;
  }

  isAfter(other: Time): boolean {
    if (this.hour > other.hour) return true;

    if (this.hour === other.hour)
      return this.minute > other.minute;

    return false;
  }

  isBeforeOrEqual(other: Time): boolean {
    return this.isBefore(other) || this.equals(other);
  }
  clone(): Time {
    return new Time(this.hour, this.minute);
  }
}
