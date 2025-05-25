import { idbRequestToPromise } from "./helpers";

export class DB {
  private static instance: DB;
  private indexedDB: IDBDatabase | null = null;
  private stores: Map<string, IDBObjectStoreParameters | undefined> = new Map();
  private version: number | undefined = undefined;
  private dbInitPromise: Promise<IDBDatabase> | null = null;

  private constructor() {}

  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance;
  }

  private async getCurrentDatabaseVersion(): Promise<number> {
    try {
      const request = indexedDB.open("use-idb-store");
      const db = await idbRequestToPromise<IDBDatabase>(request);
      const currentVersion = db.version;
      db.close();
      return currentVersion;
    } catch {
      // Database doesn't exist yet, start with version 1
      return 1;
    }
  }

  private async openDatabase(): Promise<IDBDatabase> {
    // If there's already an initialization in progress, wait for it
    if (this.dbInitPromise) {
      return this.dbInitPromise;
    }

    // Get current version if we don't have it yet
    if (this.version === undefined) {
      this.version = await this.getCurrentDatabaseVersion();
    }

    // If database is already open, check if we need to upgrade
    if (this.indexedDB) {
      const missingStores = Array.from(this.stores.keys()).filter(
        (name) => !this.indexedDB!.objectStoreNames.contains(name)
      );

      if (missingStores.length === 0) {
        return this.indexedDB;
      }

      // Close the current connection to upgrade
      this.indexedDB.close();
      this.indexedDB = null;
      this.version++;
    } else {
      // Check if we need to upgrade for new stores
      const missingStores = Array.from(this.stores.keys());
      if (missingStores.length > 0) {
        this.version++;
      }
    }

    // Create initialization promise
    this.dbInitPromise = this.initializeDatabase();

    try {
      const db = await this.dbInitPromise;
      this.dbInitPromise = null;
      return db;
    } catch (error) {
      this.dbInitPromise = null;
      throw error;
    }
  }

  private async initializeDatabase(): Promise<IDBDatabase> {
    const request = indexedDB.open("use-idb-store", this.version);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create all registered stores
      this.stores.forEach((schema, name) => {
        if (!db.objectStoreNames.contains(name)) {
          try {
            db.createObjectStore(name, schema);
          } catch (error) {
            console.error(`Error creating store ${name}:`, error);
            throw error;
          }
        }
      });
    };

    request.onblocked = () => {
      console.warn(
        "Database opening blocked. Close other tabs/windows using this database."
      );
    };

    try {
      this.indexedDB = await idbRequestToPromise<IDBDatabase>(request);
      return this.indexedDB;
    } catch (error) {
      console.error("Database opening failed:", error);
      throw error;
    }
  }

  async createStore(name: string, schema?: IDBObjectStoreParameters) {
    // Register the store
    this.stores.set(name, schema);

    // Open/upgrade database to include this store
    await this.openDatabase();
  }

  async getStore(name: string) {
    const db = await this.openDatabase();

    // Verify store exists
    if (!db.objectStoreNames.contains(name)) {
      throw new Error(
        `Store "${name}" not found in database. Available stores: ${Array.from(
          db.objectStoreNames
        ).join(", ")}`
      );
    }

    return db.transaction(name, "readwrite").objectStore(name);
  }

  async clearStore(name: string) {
    const store = await this.getStore(name);
    await idbRequestToPromise(store.clear());
  }

  async deleteStore(name: string) {
    // Remove from registry
    this.stores.delete(name);

    // Close current connection and increment version
    if (this.indexedDB) {
      this.indexedDB.close();
      this.indexedDB = null;

      // Get current version and increment
      if (this.version === undefined) {
        this.version = await this.getCurrentDatabaseVersion();
      }
      this.version++;

      const request = indexedDB.open("use-idb-store", this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Delete the store if it exists
        if (db.objectStoreNames.contains(name)) {
          db.deleteObjectStore(name);
        }

        // Recreate remaining stores that should exist
        this.stores.forEach((schema, storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            try {
              db.createObjectStore(storeName, schema);
            } catch (error) {
              console.error(`Error recreating store ${storeName}:`, error);
              throw error;
            }
          }
        });
      };

      try {
        this.indexedDB = await idbRequestToPromise<IDBDatabase>(request);
      } catch (error) {
        console.error("Database update failed during store deletion:", error);
        throw error;
      }
    }
  }
}
