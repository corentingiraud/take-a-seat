export interface StrapiData {
  id: number;
  documentId: string;
  [key: string]: any;

  toJson: () => object;
}

export type StrapiRawResponse<T extends StrapiData> = {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export type FactoryStrapiData<T extends StrapiData> = (data: any) => T;

export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
