// useStrapiAPI.ts

import { useContext } from "react";

import { AuthContext } from "@/contexts/auth-context";
import contentType from "@/lib/strapi/content-type";
import { StrapiData } from "@/models/utils/strapi-data";
import {
  FetchAllParams,
  FetchOneParams,
  CreateParams,
  UpdateParams,
} from "@/types/strapi-api-params";

export function useStrapiAPI() {
  const auth = useContext(AuthContext);

  const headers = new Headers({ "Content-Type": "application/json" });

  function withAuth() {
    const token = auth?.getJWT();

    if (token) headers.set("Authorization", `Bearer ${token}`);

    return headers;
  }

  async function fetchAll<T extends StrapiData>(params: FetchAllParams<T>) {
    const response = await contentType.fetchAll<T>(
      params.contentType,
      params.factory,
      params.queryParams,
      withAuth(),
    );

    return response;
  }

  async function fetchAllPaginated<T extends StrapiData>(
    params: FetchAllParams<T>,
  ) {
    const response = await contentType.fetchAllPaginated<T>(
      params.contentType,
      params.factory,
      params.queryParams,
      withAuth(),
    );

    return response;
  }

  async function fetchOne<T extends StrapiData>(params: FetchOneParams<T>) {
    const response = await contentType.fetchOne<T>(
      params.contentType,
      params.id,
      params.factory,
      params.queryParams,
      withAuth(),
    );

    return response;
  }

  async function create<T extends StrapiData>(params: CreateParams<T>) {
    const response = await contentType.create<T>(
      params.contentType,
      params.factory,
      params.object,
      withAuth(),
    );

    return response;
  }

  async function update<T extends StrapiData>(params: UpdateParams<T>) {
    const response = await contentType.update<T>(
      params.contentType,
      params.factory,
      params.object,
      params.fieldsToUpdate,
      withAuth(),
    );

    return response;
  }

  return { create, fetchAll, fetchAllPaginated, fetchOne, update };
}
