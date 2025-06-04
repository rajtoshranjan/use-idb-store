# API Documentation of

This document provides a comprehensive reference for the `use-idb-store` library, detailing its APIs, types, and implementation details.

## Table of Contents

- [Core Hook: useIndexedDbStore](#core-hook-useindexeddbstore)
- [Types](#types)
- [DB Class](#db-class)
- [Store Class](#store-class)
- [Helper Functions](#helper-functions)
- [Error Handling](#error-handling)
- [Browser Compatibility](#browser-compatibility)
- [Best Practices](#best-practices)

## Core Hook: useIndexedDbStore

The main entry point for interacting with the library is through the `useIndexedDbStore` hook.

### Signature

```typescript
function useIndexedDbStore<T>(
  name: string,
  options: IndexedDbStoreParams = {}
): IndexedDbStore<T>;
```

### Parameters

- `name: string` - A unique identifier for the IndexedDB object store
- `options: IndexedDbStoreParams` (optional)
  - `schema?: IDBObjectStoreParameters` - Schema configuration for the IndexedDB store

### Return Value

Returns an `IndexedDbStore<T>` object with the following properties:

- `values: Record<string, T>` - An object mapping keys to values stored in IndexedDB
- `mutations: IndexedDbStoreMutations<T>` - Methods for modifying the store
- `isLoading: boolean` - Indicates if the store data is still being loaded
- `error: Error | null` - Any error that occurred during store operations

### Example Usage

```typescript
const { values, mutations, isLoading, error } =
  useIndexedDbStore<User>("users");

// Access all values
const userList = Object.values(values);

// Get a specific value
const user = await mutations.getValue("user123");

// Add a new value
await mutations.addValue("user456", {
  id: "user456",
  name: "Jane",
  email: "jane@example.com",
});

// Update a value
await mutations.updateValue("user456", { name: "Jane Smith" });

// Delete a value
await mutations.deleteValue("user456");
```

## Types

### IndexedDbStore\<T\>

```typescript
type IndexedDbStore<T> = {
  values: Record<string, T>;
  mutations: IndexedDbStoreMutations<T>;
  isLoading: boolean;
  error: Error | null;
};
```

### IndexedDbStoreMutations\<T\>

```typescript
type IndexedDbStoreMutations<T> = {
  getValue: (id: string) => Promise<T | null>;
  addValue: (id: string, value: T) => Promise<void>;
  deleteValue: (id: string) => Promise<void>;
  updateValue: (id: string, value: Partial<T>) => Promise<void>;
  addOrUpdateValue: (id: string, value: T) => Promise<void>;
};
```

### IndexedDbStoreParams

```typescript
type IndexedDbStoreParams = {
  schema?: IDBObjectStoreParameters;
};
```

## DB Class

The `DB` class is responsible for managing the IndexedDB database connection and object stores.

### Methods

#### `getInstance()`

Static method that returns the singleton instance of the DB class.

```typescript
static getInstance(): DB
```

#### `createStore(name, schema)`

Creates a new object store in the IndexedDB database.

```typescript
async createStore(name: string, schema?: IDBObjectStoreParameters): Promise<void>
```

#### `getStore(name)`

Gets a reference to an IndexedDB object store.

```typescript
async getStore(name: string): Promise<IDBObjectStore>
```

#### `clearStore(name)`

Clears all data from an object store.

```typescript
async clearStore(name: string): Promise<void>
```

#### `deleteStore(name)`

Deletes an object store from the database.

```typescript
async deleteStore(name: string): Promise<void>
```

## Store Class

The `Store` class provides a high-level interface for working with a specific IndexedDB object store.

### Constructor

```typescript
constructor(name: string, schema?: IDBObjectStoreParameters)
```

### Methods

#### `getItem(key)`

Retrieves a specific item from the store.

```typescript
async getItem(key: string): Promise<T | null>
```

#### `getAllItems()`

Retrieves all items from the store.

```typescript
async getAllItems(): Promise<Record<string, T>>
```

#### `addItem(key, value)`

Adds a new item to the store. Will fail if the key already exists.

```typescript
async addItem(key: string, value: T): Promise<IDBValidKey>
```

#### `addOrUpdateItem(key, value)`

Adds a new item or updates an existing item in the store.

```typescript
async addOrUpdateItem(key: string, value: T): Promise<IDBValidKey>
```

#### `updateItem(key, value)`

Updates part of an existing item in the store.

```typescript
async updateItem(key: string, value: Partial<T>): Promise<IDBValidKey>
```

#### `deleteItem(key)`

Deletes an item from the store.

```typescript
async deleteItem(key: string): Promise<void>
```

#### `clear()`

Clears all items from the store.

```typescript
async clear(): Promise<void>
```

#### `destroy()`

Deletes the store from the database.

```typescript
async destroy(): Promise<void>
```

## Helper Functions

### `idbRequestToPromise<T>`

Converts an IndexedDB request to a Promise.

```typescript
async function idbRequestToPromise<T>(request: IDBRequest): Promise<T>;
```

## Error Handling

The library handles errors at multiple levels:

1. **Hook Level**: Errors during operations are captured in the `error` state
2. **Store Level**: Operations wrap errors in try/catch blocks with detailed error messages
3. **DB Level**: Version change errors are handled with automatic version upgrades

Common errors that may occur:

- `InvalidStateError`: Occurs when trying to modify database structure outside of an upgrade event
- `NotFoundError`: Occurs when trying to access a non-existent object store
- `ConstraintError`: Occurs when adding an item with a key that already exists
- `QuotaExceededError`: Occurs when the browser's storage quota is exceeded

## Browser Compatibility

### Supported Browsers

- Chrome 24+
- Firefox 16+
- Safari 10+
- Edge 12+
- Opera 15+
- iOS Safari 10.3+
- Android Browser 4.4+

### Known Issues

- Safari has a 7-day limit on IndexedDB storage in private browsing mode
- iOS Safari may clear IndexedDB storage after 7 days of inactivity
- Older browsers may have smaller storage limits

## Best Practices

1. **Key Selection**: Choose meaningful, unique keys for your items

   ```typescript
   // Good
   mutations.addValue("user_123", userData);

   // Avoid using arbitrary numbers unless they have meaning
   mutations.addValue("1", userData);
   ```

2. **Error Handling**: Always handle potential errors

   ```typescript
   try {
     await mutations.addValue("key", data);
   } catch (err) {
     // Handle error appropriately
     console.error("Failed to add item:", err);
   }
   ```

3. **Data Structure**: Keep data structures flat and serializable

   ```typescript
   // Good
   const userData = {
     id: "user_123",
     name: "John",
     preferences: { theme: "dark" },
   };

   // Avoid circular references or functions
   const badUserData = {
     id: "user_123",
     doSomething: () => {}, // Functions won't be stored properly
     circular: this, // Circular references will cause issues
   };
   ```

4. **Performance**: Be mindful of data size

   ```typescript
   // For large datasets, consider pagination or chunking
   const firstPage = Object.values(values).slice(0, 20);
   ```

5. **Cleanup**: Clean up unused stores to avoid database bloat

   ```typescript
   // When a component is permanently unmounted
   useEffect(() => {
     return () => {
       if (shouldCleanupStore) {
         const store = new Store("tempStore");
         store.destroy();
       }
     };
   }, []);
   ```
