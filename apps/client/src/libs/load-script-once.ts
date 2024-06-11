import loadScript from "load-script";

const cache: Record<string, Promise<void>> = {};
export function loadScriptOnce(src: string, callback?: (error?: Error) => void): Promise<void> {
  let promise = cache[src];
  if (!(src in cache)) {
    promise = cache[src] = doLoad(src);

    // On error, fail to allow retry
    promise.catch(() => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete cache[src];
    });
  }

  if (callback) {
    promise.then(() => callback, callback);
  }

  return promise;
}

function doLoad(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    loadScript(src, (error: Error | null) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
