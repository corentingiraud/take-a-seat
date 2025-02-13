import qs from "qs";

import { API_URL } from "@/config/site";
import { FactoryStrapiData, StrapiData } from "@/models/utils/strapi-data";

// General fetch utility
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

// Fetch all entities of a type
async function fetchAll<T extends StrapiData>(
  contentType: string,
  factory: FactoryStrapiData<T>,
  params: Record<string, unknown> = {},
  headers: HeadersInit = {},
): Promise<T[]> {
  try {
    const queryParams = { ...params };
    const url = `${API_URL}/${contentType}?${qs.stringify(queryParams)}`;
    const jsonData = await fetchFromStrapi<{ data: any[] }>(url, headers);

    return jsonData.data ? jsonData.data.map(factory) : [];
  } catch (error) {
    console.error("FetchContentTypeError", error);
    throw error;
  }
}

// Fetch a single entity by ID
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

    return jsonData.data ? factory(jsonData.data) : null;
  } catch (error) {
    console.error("FetchEntityError", error);
    throw error;
  }
}

export default { fetchAll, fetchOne };
