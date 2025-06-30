export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const METHODS: Record<HTTPMethod, HTTPMethod> = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

export interface RequestOptions {
  headers?: Record<string, string>;
  data?: Record<string, unknown> | string | FormData;
  timeout?: number;
}

interface InternalRequestOptions {
  headers: Record<string, string>;
  method: HTTPMethod;
  data?: Record<string, unknown> | string | FormData;
}

function queryStringify(data: Record<string, unknown>): string {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Data must be a non-null object');
  }

  const keys = Object.keys(data);

  return keys.reduce((result, key, index) => {
    const value = data[key];
    const encodedKey = encodeURIComponent(key);
    const encodedValue =
            typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
              ? encodeURIComponent(String(value))
              : encodeURIComponent(JSON.stringify(value));
    const separator = index < keys.length - 1 ? '&' : '';
    return `${result}${encodedKey}=${encodedValue}${separator}`;
  }, '?');
}

export class HTTPTransport {
  public get(
    url: string,
    options: RequestOptions = {},
  ): Promise<XMLHttpRequest> {
    return (this.constructor as typeof HTTPTransport).request(
      url,
      {
        headers: options.headers ?? {},
        method: METHODS.GET,
        data: options.data,
      },
      options.timeout,
    );
  }

  public post(
    url: string,
    options: RequestOptions = {},
  ): Promise<XMLHttpRequest> {
    return (this.constructor as typeof HTTPTransport).request(
      url,
      {
        headers: options.headers ?? {},
        method: METHODS.POST,
        data: options.data,
      },
      options.timeout,
    );
  }

  public put(
    url: string,
    options: RequestOptions = {},
  ): Promise<XMLHttpRequest> {
    return (this.constructor as typeof HTTPTransport).request(
      url,
      {
        headers: options.headers ?? {},
        method: METHODS.PUT,
        data: options.data,
      },
      options.timeout,
    );
  }

  public delete(
    url: string,
    options: RequestOptions = {},
  ): Promise<XMLHttpRequest> {
    return (this.constructor as typeof HTTPTransport).request(
      url,
      {
        headers: options.headers ?? {},
        method: METHODS.DELETE,
        data: options.data,
      },
      options.timeout,
    );
  }

  private static request(
    url: string,
    options: InternalRequestOptions,
    timeout: number = 5000,
  ): Promise<XMLHttpRequest> {
    const { headers, method, data } = options;

    return new Promise<XMLHttpRequest>((resolve, reject) => {
      if (!method) {
        reject(new Error('No method provided'));
        return;
      }

      const xhr = new XMLHttpRequest();
      const isGet = method === METHODS.GET;
      let requestUrl = url;

      if (isGet && data && typeof data === 'object' && !(data instanceof FormData)) {
        requestUrl = `${url}${queryStringify(data as Record<string, unknown>)}`;
      }

      xhr.open(method, requestUrl);

      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.onload = () => {
        resolve(xhr);
      };
      xhr.onabort = () => {
        reject(new Error('Request aborted'));
      };
      xhr.onerror = () => {
        reject(new Error('Network error'));
      };
      xhr.ontimeout = () => {
        reject(new Error('Request timeout'));
      };

      xhr.timeout = timeout;

      if (!isGet && data !== undefined) {
        if (data instanceof FormData) {
          xhr.send(data);
        } else if (typeof data === 'string') {
          xhr.send(data);
        } else {
          if (!headers['Content-Type'] && !headers['content-type']) {
            xhr.setRequestHeader('Content-Type', 'application/json');
          }
          xhr.send(JSON.stringify(data));
        }
      } else {
        xhr.send();
      }
    });
  }
}
