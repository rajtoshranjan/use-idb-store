export type IndexedDbStoreMutations<T> = {
  getValue: (id: string) => Promise<T | null>;
  addValue: (id: string, value: T) => Promise<void>;
  deleteValue: (id: string) => Promise<void>;
  updateValue: (id: string, value: Partial<T>) => Promise<void>;
  addOrUpdateValue: (id: string, value: T) => Promise<void>;
};

export type IndexedDbStore<T> = {
  values: Record<string, T>;
  mutations: IndexedDbStoreMutations<T>;
  isLoading: boolean;
  isReady: boolean;
  error: Error | null;
};

export type IndexedDbStoreParams = {
  schema?: IDBObjectStoreParameters;
};

export type StoreEvent = "change" | "error";

export type StoreEventCallback = (event: CustomEvent) => void;
