import { DB } from "./db";
import { idbRequestToPromise } from "./helpers";
import { StoreEvent, StoreEventCallback } from "./types";

export class Store<T = any> {
  private static instance: Record<string, Store<any>> = {};
  protected name: string;
  private db: DB;
  private schema?: IDBObjectStoreParameters;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private eventListeners: Record<StoreEvent, StoreEventCallback[]> = {
    change: [],
    error: [],
  };

  private constructor(name: string, schema?: IDBObjectStoreParameters) {
    this.db = DB.getInstance();
    this.name = name;
    this.schema = schema;
    this.initPromise = this.setup();
  }

  public static getInstance<T>(
    name: string,
    schema?: IDBObjectStoreParameters
  ): Store<T> {
    if (!Store.instance[name]) {
      Store.instance[name] = new Store<T>(name, schema);
    }
    return Store.instance[name] as Store<T>;
  }

  async setup() {
    try {
      await this.db.createStore(this.name, this.schema);
      this.isInitialized = true;
    } catch (error) {
      throw error;
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      if (this.initPromise) {
        await this.initPromise;
      } else {
        this.initPromise = this.setup();
        await this.initPromise;
      }
    }
  }

  private async getStore() {
    await this.ensureInitialized();
    return this.db.getStore(this.name);
  }

  async getItem(key: string): Promise<T | null> {
    try {
      const store = await this.getStore();
      const request = store.get(key);
      return idbRequestToPromise<T | null>(request);
    } catch (error) {
      this.emit("error", error);
      return null;
    }
  }

  async getAllItems(): Promise<Record<string, T>> {
    try {
      const store = await this.getStore();
      const request = store.openCursor();
      const result: Record<string, T> = {};

      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>)
            .result;
          if (cursor) {
            result[cursor.key.toString()] = cursor.value;
            cursor.continue();
          } else {
            resolve(result);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      this.emit("error", error);
      return {};
    }
  }

  async addItem(key: string, value: T): Promise<IDBValidKey> {
    try {
      const store = await this.getStore();
      const request = store.add(value, key);
      const result = await idbRequestToPromise<IDBValidKey>(request);
      this.emit("change", { add: { key, value } });
      return result;
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }

  async addOrUpdateItem(key: string, value: T): Promise<IDBValidKey> {
    try {
      const store = await this.getStore();
      const request = store.put(value, key);
      const result = await idbRequestToPromise<IDBValidKey>(request);
      this.emit("change", { addOrUpdate: { key, value } });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateItem(key: string, value: Partial<T>): Promise<IDBValidKey> {
    try {
      const store = await this.getStore();
      const request = store.openCursor(key);

      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>)
            .result;

          if (cursor) {
            const existingItem = cursor.value as T;
            const updatedItem = { ...existingItem, ...value };

            const updateRequest = cursor.update(updatedItem);
            updateRequest.onsuccess = () => {
              resolve(key);
              this.emit("change", { update: key });
            };
            updateRequest.onerror = () => {
              reject(updateRequest.error);
              this.emit("error", updateRequest.error);
            };
          } else {
            reject(
              new Error(`Item with key ${key} not found in store ${this.name}`)
            );
            this.emit(
              "error",
              new Error(`Item with key ${key} not found in store ${this.name}`)
            );
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }

  async deleteItem(key: string): Promise<void> {
    try {
      const store = await this.getStore();
      const request = store.delete(key);
      await idbRequestToPromise<void>(request);
      this.emit("change", { delete: { key } });
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }

  /**
   * Emits an event to all registered listeners for a specific event type
   * @param event - The type of event to emit ('change' or 'error')
   * @param detail - The detail to emit with the event
   */
  emit(event: StoreEvent, detail: any) {
    const listeners = this.eventListeners[event];
    if (listeners && listeners.length > 0) {
      // Create a custom event with the data
      const customEvent = new CustomEvent(event, { detail });
      listeners.forEach((callback) => callback(customEvent));
    }
  }

  /**
   * Registers an event listener for the specified store event
   */
  on(event: StoreEvent, callback: StoreEventCallback) {
    this.eventListeners[event].push(callback);
  }

  /**
   * Removes an event listener from the store
   */
  off(event: StoreEvent, callback: StoreEventCallback) {
    this.eventListeners[event] = this.eventListeners[event].filter(
      (listener) => listener !== callback
    );
  }

  /**
   * Clears all items from the store.
   */
  async clear() {
    try {
      const store = await this.getStore();
      store.clear();
      this.emit("change", { clear: true });
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }

  /**
   * Destroys the store and deletes it from the database.
   */
  async destroy() {
    try {
      await this.db.deleteStore(this.name);
      this.emit("change", { destroy: true });
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }
}
