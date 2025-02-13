export interface StrapiData {
  id: number;
  [key: string]: any;
}

export type FactoryStrapiData<T extends StrapiData> = (data: any) => T;
