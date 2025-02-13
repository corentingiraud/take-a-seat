import { FactoryStrapiData, StrapiData } from "@/models/utils/strapi-data";

export type FetchAllParams<T extends StrapiData> = {
  contentType: string;
  factory: FactoryStrapiData<T>;
  queryParams?: Record<string, unknown>;
};

export type FetchOneParams<T extends StrapiData> = FetchAllParams<T> & {
  id: string;
};
