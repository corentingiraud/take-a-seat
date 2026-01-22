// useStrapiAPI.ts

import { useCallback, useContext, useMemo } from "react";

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

  const getHeaders = useCallback(() => {
    const headers = new Headers({ "Content-Type": "application/json" });
    const token = auth?.getJWT();

    if (token) headers.set("Authorization", `Bearer ${token}`);

    return headers;
  }, [auth]);

  const fetchAll = useCallback(
    async function <T extends StrapiData>(params: FetchAllParams<T>) {
      const response = await contentType.fetchAll<T>(
        params.contentType,
        params.factory,
        params.queryParams,
        getHeaders(),
        params.autoPaginate,
      );

      return response;
    },
    [getHeaders],
  );

  const fetchAllPaginated = useCallback(
    async function <T extends StrapiData>(params: FetchAllParams<T>) {
      const response = await contentType.fetchAllPaginated<T>(
        params.contentType,
        params.factory,
        params.queryParams,
        getHeaders(),
      );

      return response;
    },
    [getHeaders],
  );

  const fetchOne = useCallback(
    async function <T extends StrapiData>(params: FetchOneParams<T>) {
      const response = await contentType.fetchOne<T>(
        params.contentType,
        params.id,
        params.factory,
        params.queryParams,
        getHeaders(),
      );

      return response;
    },
    [getHeaders],
  );

  const create = useCallback(
    async function <T extends StrapiData>(params: CreateParams<T>) {
      const response = await contentType.create<T>(
        params.contentType,
        params.factory,
        params.object,
        getHeaders(),
      );

      return response;
    },
    [getHeaders],
  );

  const update = useCallback(
    async function <T extends StrapiData>(params: UpdateParams<T>) {
      const response = await contentType.update<T>(
        params.contentType,
        params.factory,
        params.object,
        params.fieldsToUpdate,
        getHeaders(),
      );

      return response;
    },
    [getHeaders],
  );

  return useMemo(
    () => ({ create, fetchAll, fetchAllPaginated, fetchOne, update }),
    [create, fetchAll, fetchAllPaginated, fetchOne, update],
  );
}
