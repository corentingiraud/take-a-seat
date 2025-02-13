import { StrapiData } from "./utils/strapi-data";

import { FetchAllParams } from "@/types/fetch-params";

export class CoworkingSpace implements StrapiData {
  id!: number;
  name!: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  static fromJson(json: any): CoworkingSpace {
    return new CoworkingSpace(json.id, json.name);
  }

  static get fetchParams(): FetchAllParams<CoworkingSpace> {
    return {
      contentType: "coworking-spaces",
      factory: CoworkingSpace.fromJson,
    };
  }
}
