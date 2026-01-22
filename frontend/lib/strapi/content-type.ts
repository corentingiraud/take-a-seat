import qs from "qs";

import { API_URL } from "@/config/site";
import {
  FactoryStrapiData,
  StrapiData,
  StrapiRawResponse,
} from "@/models/utils/strapi-data";

async function fetchFromStrapi<T>(
  url: string,
  headers: HeadersInit = {},
): Promise<T> {
  const response = await fetch(url, { method: "GET", headers });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch data from Strapi (url=${url.toString()}, status=${response.status})`,
    );
  }

  return response.json();
}

async function fetchAll<T extends StrapiData>(
  contentType: string,
  factory: FactoryStrapiData<T>,
  params: Record<string, unknown> = {},
  headers: HeadersInit = {},
  autoPaginate: boolean = false,
): Promise<T[]> {
  try {
    if (!autoPaginate) {
      const queryParams = { ...params };
      const url = `${API_URL}/${contentType}?${qs.stringify(queryParams)}`;
      const jsonData = await fetchFromStrapi<{ data: any[] }>(url, headers);

      if (jsonData.data) return jsonData.data.map(factory);

      if (Array.isArray(jsonData)) return jsonData.map(factory);

      if (typeof jsonData === "object") return [factory(jsonData)];

      return [];
    }

    // Auto-paginate: fetch all pages
    const allItems: T[] = [];
    let currentPage = 1;
    let pageCount = 1;

    do {
      const queryParams = {
        ...params,
        "pagination[page]": currentPage,
        "pagination[pageSize]": 100,
      };
      const url = `${API_URL}/${contentType}?${qs.stringify(queryParams)}`;
      const jsonData = await fetchFromStrapi<{
        data: any[];
        meta?: { pagination?: { pageCount?: number } };
      }>(url, headers);

      if (jsonData.data) {
        allItems.push(...jsonData.data.map(factory));
      }

      pageCount = jsonData.meta?.pagination?.pageCount ?? 1;
      currentPage++;
    } while (currentPage <= pageCount);

    return allItems;
  } catch (error) {
    throw error;
  }
}

async function fetchAllPaginated<T extends StrapiData>(
  contentType: string,
  factory: FactoryStrapiData<T>,
  params: Record<string, unknown> = {},
  headers: HeadersInit = {},
): Promise<StrapiRawResponse<T>> {
  try {
    const queryParams = { ...params };
    const url = `${API_URL}/${contentType}?${qs.stringify(queryParams)}`;

    const jsonData = await fetchFromStrapi<{
      data: any[];
      meta?: { pagination: any };
    }>(url, headers);

    return {
      data: (jsonData?.data ?? []).map(factory),
      meta: {
        pagination: {
          page: jsonData?.meta?.pagination?.page ?? 1,
          pageSize:
            jsonData?.meta?.pagination?.pageSize ??
            (params["pagination[pageSize]"] as number) ??
            25,
          pageCount: jsonData?.meta?.pagination?.pageCount ?? 1,
          total:
            jsonData?.meta?.pagination?.total ?? (jsonData?.data ?? []).length,
        },
      },
    };
  } catch (error) {
    throw error;
  }
}

async function fetchOne<T extends StrapiData>(
  contentType: string,
  id: string | number,
  factory: FactoryStrapiData<T>,
  params: Record<string, unknown> = {},
  headers: HeadersInit = {},
): Promise<T | null> {
  try {
    const queryParams = { ...params };
    const url = `${API_URL}/${contentType}/${id}?${qs.stringify(queryParams)}`;
    const jsonData = await fetchFromStrapi<{ data: T }>(url, headers);

    if (jsonData.data) return factory(jsonData.data);

    return factory(jsonData);
  } catch (error) {
    throw error;
  }
}

async function create<T extends StrapiData>(
  contentType: string,
  factory: FactoryStrapiData<T>,
  object: T,
  headers: HeadersInit = {},
): Promise<T | null> {
  try {
    const url = `${API_URL}/${contentType}`;

    const body = {
      data: object.toJson(),
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();

    return jsonResponse.data ? factory(jsonResponse.data) : null;
  } catch (error) {
    throw error;
  }
}

async function update<T extends StrapiData>(
  contentType: string,
  factory: FactoryStrapiData<T>,
  object: T,
  fieldsToUpdate: Array<keyof T>,
  headers: HeadersInit = {},
): Promise<T | null> {
  try {
    const url = `${API_URL}/${contentType}/${object.documentId}`;

    const body = {
      data: object.toJson(),
    };

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();

    return jsonResponse.data ? factory(jsonResponse.data) : null;
  } catch (error) {
    throw error;
  }
}

export default { fetchAll, fetchAllPaginated, fetchOne, create, update };
