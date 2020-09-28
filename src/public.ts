import fetch from "node-fetch";
import FetchError from "./error";

export interface IPublicClientOptions {
  url: string | URL;
}

export class PublicClient {
  public readonly url: URL;

  public constructor({ url }: IPublicClientOptions) {
    this.url = new URL(url.toString());
    if (!this.url.pathname.endsWith("/")) {
      this.url.pathname += "/";
    }
  }

  /**
   * Make a request and parse the body as JSON
   */
  public async fetch(
    path: string,
    { headers, ...options }: fetch.RequestInit = {}
  ): Promise<unknown> {
    const jsonHeaders = new fetch.Headers(headers);
    jsonHeaders.set("Content-Type", "application/json");
    const url = new URL(this.url.toString());
    url.pathname += path.startsWith("/") ? path.substring(1) : path;
    const response = await PublicClient.fetch(url, {
      headers: jsonHeaders,
      ...options,
    });
    return response;
  }

  /**
   * Add query to URL
   */
  public static setQuery(
    url: URL,
    query: Record<string, string | number | boolean | undefined>
  ): void {
    for (const key in query) {
      const value = query[key];
      if (value !== undefined) {
        url.searchParams.set(key, value.toString());
      }
    }
  }

  /**
   * Make a request and parse the body as JSON
   */
  public static async fetch(
    url: string | URL,
    options: fetch.RequestInit = {}
  ): Promise<unknown> {
    const response = await fetch(url.toString(), { ...options });
    if (!response.ok) {
      throw new FetchError(response.statusText, response);
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      throw new FetchError(error.message, response);
    }
  }
}