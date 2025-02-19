import { useContext } from "react";

import { AuthContext } from "@/contexts/auth-context";
import { StrapiData } from "@/models/utils/strapi-data";
import contentType from "@/lib/strapi/content-type";
import {
  CreateParams,
  FetchAllParams,
  FetchOneParams,
  UpdateParams,
} from "@/types/strapi-api-params";

export function useStrapiAPI() {
  const auth = useContext(AuthContext);

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  async function fetchAll<T extends StrapiData>(params: FetchAllParams<T>) {
    const token = auth?.getToken();

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
    const token = auth?.getToken();

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
    const token = auth?.getToken();

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

  async function update<T extends StrapiData>(params: UpdateParams<T>) {
    const token = auth?.getToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await contentType.update<T>(
      params.contentType,
      params.factory,
      params.object,
      params.fieldsToUpdate,
      headers,
    );

    return response;
  }

  return { create, fetchAll, fetchOne, update };
}
