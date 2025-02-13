import { useContext } from "react";

import { AuthContext } from "@/contexts/auth-context";
import { StrapiData } from "@/models/utils/strapi-data";
import fetchContentType from "@/lib/strapi/fetch-content-type";
import { FetchAllParams, FetchOneParams } from "@/types/fetch-params";

export function useFetchContentType() {
  const auth = useContext(AuthContext);
  const token = auth?.getToken();

  async function fetchAll<T extends StrapiData>(params: FetchAllParams<T>) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetchContentType.fetchAll<T>(
      params.contentType,
      params.factory,
      params.queryParams,
      headers,
    );

    return response;
  }
  async function fetchOne<T extends StrapiData>(params: FetchOneParams<T>) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetchContentType.fetchOne<T>(
      params.contentType,
      params.id,
      params.factory,
      params.queryParams,
      headers,
    );

    return response;
  }

  return { fetchAll, fetchOne };
}
