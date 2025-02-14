import { useContext } from "react";

import { AuthContext } from "@/contexts/auth-context";
import { StrapiData } from "@/models/utils/strapi-data";
import contentType from "@/lib/strapi/content-type";
import { CreateParams, FetchAllParams, FetchOneParams } from "@/types/fetch-params";

export function useStrapiAPI() {
  const auth = useContext(AuthContext);
  const token = auth?.getToken();

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  async function fetchAll<T extends StrapiData>(params: FetchAllParams<T>) {
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await contentType.fetchAll<T>(
      params.contentType,
      params.factory,
      params.queryParams,
      headers,
    );

    return response;
  }

  async function fetchOne<T extends StrapiData>(params: FetchOneParams<T>) {
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await contentType.fetchOne<T>(
      params.contentType,
      params.id,
      params.factory,
      params.queryParams,
      headers,
    );

    return response;
  }

  async function create<T extends StrapiData>(params: CreateParams<T>) {
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await contentType.create<T>(
      params.contentType,
      params.factory,
      params.object,
      headers,
    );

    return response;
  }

  return { create, fetchAll, fetchOne };
}
