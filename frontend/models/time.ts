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
}
