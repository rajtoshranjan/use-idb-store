/**
 * Converts an IndexedDB request into a Promise
 * @template T The type of the result that will be returned by the IndexedDB request
 * @param request The IndexedDB request to convert to a Promise
 * @returns A Promise that resolves with the request result or rejects with an error message
 */
export async function idbRequestToPromise<T>(request: IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => {
      resolve(request.result);
    });
    request.addEventListener("error", (event: Event) => {
      // Extract more detailed error information
      const target = event.target as IDBRequest;
      const error = target.error;

      if (error) {
        const detailedError = new Error(
          `IndexedDB Error: ${error.name} - ${error.message}`
        );
        (detailedError as any).originalError = error;
        (detailedError as any).event = event;
        reject(detailedError);
      } else {
        reject(new Error("IndexedDB operation failed with unknown error"));
      }
    });
  });
}

/**
 * Safely executes an async operation with error handling
 * @template T The type of the result that will be returned by the operation
 * @param fn The async function to execute
 * @returns A Promise that resolves with the result or null if an error occurs
 */
export async function safeCall<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

/**
 * Safely executes an async operation that returns void with error handling
 * @param fn The async function to execute
 * @returns A Promise that resolves to void, silently handling any errors
 */
export async function safeVoidCall(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch {
    // Silent fail
  }
}
