import { idbRequestToPromise } from "./helpers";
export class DB {
  private static instance: DB;
  private dbName: string = "use-idb-store";
  private indexedDB: IDBDatabase | null = null;
  private stores: Map<string, IDBObjectStoreParameters | undefined> = new Map();
  private version: number | undefined = undefined;
  private dbInitPromise: Promise<IDBDatabase> | null = null;
  private isClosing: boolean = false;

  private constructor() {}

  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance;
  }

  /**
   * Sets up event handlers for multi-tab coordination
   */
  private setupDatabaseEventHandlers(db: IDBDatabase) {
    // Handle version change - fired when another tab wants to upgrade the database
    db.onversionchange = () => {
      this.isClosing = true;
      db.close();
      this.indexedDB = null;
      this.version = undefined;
      this.isClosing = false;
    };

    // Handle unexpected close
    db.onclose = () => {
      if (!this.isClosing) {
        this.indexedDB = null;
        this.version = undefined;
      }
    };
  }

  private async getCurrentDatabaseVersion(): Promise<number> {
    try {
      const request = indexedDB.open(this.dbName);
      const db = await idbRequestToPromise<IDBDatabase>(request);
      const currentVersion = db.version;
      db.close();
      return currentVersion;
    } catch {
      // Database doesn't exist yet, start with version 1
      return 1;
    }
  }

  private async sync(): Promise<IDBDatabase> {
    // If there's already an initialization in progress, wait for it
    if (this.dbInitPromise) {
      return this.dbInitPromise;
    }

    if (this.version === undefined) {
      this.version = await this.getCurrentDatabaseVersion();
    }

    if (this.indexedDB) {
      const missingStores = Array.from(this.stores.keys()).filter(
        (name) => !this.indexedDB!.objectStoreNames.contains(name),
      );

      if (missingStores.length === 0) {
        return this.indexedDB;
      }

      this.indexedDB.close();
      this.indexedDB = null;
      this.version++;
    } else {
      const missingStores = Array.from(this.stores.keys());
      if (missingStores.length > 0) {
        this.version++;
      }
    }

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
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create all registered stores.
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
          "Database upgrade blocked. Other tabs have open connections. Please close them or they will be closed automatically.",
        );
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.indexedDB = db;

        // Set up multi-tab coordination handlers.
        this.setupDatabaseEventHandlers(db);

        resolve(db);
      };

      request.onerror = () => {
        console.error("Database opening failed:", request.error);
        reject(request.error);
      };
    });
  }

  async createStore(name: string, schema?: IDBObjectStoreParameters) {
    // Register the store
    this.stores.set(name, schema);

    await this.sync();
  }

  async getStore(name: string) {
    const db = await this.sync();

    if (!db.objectStoreNames.contains(name)) {
      throw new Error(
        `Store "${name}" not found in database. Available stores: ${Array.from(
          db.objectStoreNames,
        ).join(", ")}`,
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
      this.isClosing = true;
      this.indexedDB.close();
      this.indexedDB = null;
      this.isClosing = false;

      // Get current version and increment
      if (this.version === undefined) {
        this.version = await this.getCurrentDatabaseVersion();
      }
      this.version++;

      return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);

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

        request.onblocked = () => {
          console.warn(
            "Database upgrade blocked during store deletion. Waiting for other tabs to close connections.",
          );
        };

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          this.indexedDB = db;

          // Set up multi-tab coordination handlers
          this.setupDatabaseEventHandlers(db);

          resolve();
        };

        request.onerror = () => {
          console.error(
            "Database update failed during store deletion:",
            request.error,
          );
          reject(request.error);
        };
      });
    }
  }
}
