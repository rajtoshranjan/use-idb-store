import { useEffect, useState, useRef } from "react";
import { Store } from "./store";
import {
  IndexedDbStore,
  IndexedDbStoreMutations,
  IndexedDbStoreParams,
} from "./types";
import { safeCall, safeVoidCall } from "./helpers";

export const useIndexedDbStore = <T,>(
  name: string,
  { schema }: IndexedDbStoreParams = {}
): IndexedDbStore<T> => {
  // States.
  // HACK: Force update to trigger re-render.
  const [, forceUpdate] = useState({});

  // Refs.
  const storeRef = useRef<Store<T> | null>(null);
  const valuesRef = useRef<Record<string, T>>({});
  const isLoadingRef = useRef(true);
  const isReadyRef = useRef(false);
  const errorRef = useRef<Error | null>(null);

  // useEffect.
  useEffect(() => {
    if (storeRef.current) return;

    storeRef.current = Store.getInstance<T>(name, schema);

    const loadData = async () => {
      try {
        if (!storeRef.current) return;

        isLoadingRef.current = true;
        errorRef.current = null;

        const data = await storeRef.current.getAllItems();

        valuesRef.current = data;
        isLoadingRef.current = false;
      } catch (err) {
        console.error("Error loading indexed DB data:", err);
        errorRef.current = err instanceof Error ? err : new Error(String(err));
        isLoadingRef.current = false;
      }
      forceUpdate({});
    };

    const handleError = (err: unknown) => {
      errorRef.current = err instanceof Error ? err : new Error(String(err));
      isLoadingRef.current = false;
      forceUpdate({});
    };

    // Initial load.
    loadData().then(() => {
      isReadyRef.current = true;
      forceUpdate({});
    });

    storeRef.current.on("change", loadData);
    storeRef.current.on("error", handleError);

    return () => {
      // TODO: Unsubscribe from changes.
      // storeRef.current?.off("change", loadData);
      // storeRef.current?.off("error", handleError);
    };
  }, []);

  // Handlers.
  const mutations: IndexedDbStoreMutations<T> = {
    getValue: async (id: string) =>
      safeCall(async () => {
        const storeValue = await storeRef.current!.getItem(id);
        return storeValue ?? valuesRef.current[id] ?? null;
      }),

    addValue: (id: string, value: T) =>
      safeVoidCall(() => storeRef.current!.addItem(id, value)),

    deleteValue: (id: string) =>
      safeVoidCall(() => storeRef.current!.deleteItem(id)),

    updateValue: (id: string, value: Partial<T>) =>
      safeVoidCall(() => storeRef.current!.updateItem(id, value)),

    addOrUpdateValue: (id: string, value: T) =>
      safeVoidCall(() => storeRef.current!.addOrUpdateItem(id, value)),
  };

  return {
    values: valuesRef.current,
    mutations,
    isLoading: isLoadingRef.current,
    error: errorRef.current,
    isReady: isReadyRef.current,
  };
};
