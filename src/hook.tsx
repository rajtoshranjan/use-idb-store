import { useEffect, useState, useRef } from "react";
import { Store } from "./store";
import {
  IndexedDbStore,
  IndexedDbStoreMutations,
  IndexedDbStoreParams,
} from "./types";

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

    // Initial load.
    loadData();
    isReadyRef.current = true;
    forceUpdate({});

    storeRef.current.on("change", loadData);

    return () => {
      // HACK: This is not working.
      // storeRef.current?.off("change", loadData);
    };
  }, []);

  // Handlers.
  const getValue = async (id: string) => {
    if (!storeRef.current) return null;
    return storeRef.current.getItem(id) ?? valuesRef.current[id] ?? null;
  };

  const addValue = async (id: string, value: T) => {
    if (!storeRef.current) return;

    try {
      await storeRef.current.addItem(id, value);
      // setValues((prev) => ({ ...prev, [id]: value }));
    } catch (err) {
      console.error(`Error setting value for ID ${id}:`, err);
      errorRef.current = err instanceof Error ? err : new Error(String(err));
    }
  };

  const deleteValue = async (id: string) => {
    if (!storeRef.current) return;

    try {
      await storeRef.current.deleteItem(id);
    } catch (err) {
      console.error(`Error deleting value for ID ${id}:`, err);
      errorRef.current = err instanceof Error ? err : new Error(String(err));
    }
  };

  const updateValue = async (id: string, value: Partial<T>) => {
    if (!storeRef.current) return;
    try {
      await storeRef.current.updateItem(id, value);
    } catch (err) {
      console.error(`Error updating value for ID ${id}:`, err);
      errorRef.current = err instanceof Error ? err : new Error(String(err));
    }
  };

  const addOrUpdateValue = async (id: string, value: T) => {
    if (!storeRef.current) return;
    try {
      await storeRef.current.addOrUpdateItem(id, value);
    } catch (err) {
      console.error(`Error adding or updating value for ID ${id}:`, err);
      errorRef.current = err instanceof Error ? err : new Error(String(err));
    }
  };

  const mutations: IndexedDbStoreMutations<T> = {
    getValue,
    addValue,
    addOrUpdateValue,
    deleteValue,
    updateValue,
  };

  return {
    values: valuesRef.current,
    mutations,
    isLoading: isLoadingRef.current,
    error: errorRef.current,
    isReady: isReadyRef.current,
  };
};
