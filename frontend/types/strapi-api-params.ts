import { FactoryStrapiData, StrapiData } from "@/models/utils/strapi-data";

export type GeneralParams<T extends StrapiData> = {
  contentType: string;
  factory: FactoryStrapiData<T>;
};

export type FetchAllParams<T extends StrapiData> = GeneralParams<T> & {
  queryParams?: Record<string, unknown>;
};

export type FetchOneParams<T extends StrapiData> = GeneralParams<T> & {
  id: string;
  queryParams?: Record<string, unknown>;
};

export type CreateParams<T extends StrapiData> = GeneralParams<T> & {
  object: T;
};

export type UpdateParams<T extends StrapiData> = GeneralParams<T> & {
  object: T;
  fieldsToUpdate: Array<keyof T>;
};

export type StrapiPagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export type StrapiResponse<T> = {
  data: T[];
  meta: { pagination: StrapiPagination };
};
