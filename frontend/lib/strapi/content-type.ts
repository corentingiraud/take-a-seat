import qs from "qs";

import { API_URL } from "@/config/site";
import { FactoryStrapiData, StrapiData } from "@/models/utils/strapi-data";

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
): Promise<T[]> {
  try {
    const queryParams = { ...params };
    const url = `${API_URL}/${contentType}?${qs.stringify(queryParams)}`;
    const jsonData = await fetchFromStrapi<{ data: any[] }>(url, headers);

    return jsonData.data ? jsonData.data.map(factory) : [];
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

    return jsonData.data ? factory(jsonData.data) : null;
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

export default { fetchAll, fetchOne, create, update };
