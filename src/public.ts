import fetch from "node-fetch";
import { URL } from "url";
import FetchError from "./error";

export interface IPublicClientOptions {
  url: string | URL;
}

export interface IOrderBookSnapshotOptions {
  instrument: string;
}

export type ICandleSize =
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "2h"
  | "4h"
  | "8h"
  | "12h"
  | "1d"
  | "1w"
  | "1M";

export interface ICandlesOptions extends IOrderBookSnapshotOptions {
  startDate: string;
  endDate: string;
  type?: ICandleSize;
  count?: number;
}

export interface IInstrument {
  baseAsset: string;
  quoteAsset: string;
  hidden: 0 | 1;
  makerFee: number;
  makerFeeLimit: number;
  takerFee: number;
  takerFeeLimit: number;
  priceScale: number;
  amountScale: number;
  createdAt: string;
  updatedAt: string;
  status: "Open" | "Paused" | "Halted";
}

export interface ISupportedInstruments {
  serverTime: number;
  pairs: Record<string, IInstrument | undefined>;
}

export interface IAsset {
  id: string;
  can_deposit: boolean;
  can_withdraw: boolean;
  asset_name: string;
  withdrawal_fee: number;
  scale: number;
}

export interface ISupportedAssets {
  data: IAsset[];
}

export interface IOrderBookSnapshot {
  instrument: string;
  bids: { amount: number; price: number }[];
  asks: { amount: number; price: number }[];
  version: number;
  askTotalAmount: number;
  bidTotalAmount: number;
  snapshot: true;
}

export interface ICandle {
  instrument: string;
  start: string;
  end: string;
  low: number;
  high: number;
  volume: number;
  quoteVolume: number;
  open: number;
  close: number;
}

export interface ICandlesResponse {
  success: true;
  instrument: string;
  data: ICandle[];
  startDateTime: string;
  endDateTime: string;
}

export interface ITier {
  description: string;
  volume: number;
  makerFee: number;
  takerFee: number;
}

export interface IGroup {
  description: string;
  tiers: ITier[];
  instruments: string[];
}

export interface IRootAsset {
  rootAsset: string;
}

export interface ITiersInfo extends IRootAsset {
  groups: IGroup[];
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
   * Get the list of all supported instruments
   */
  public async getInstruments(): Promise<ISupportedInstruments> {
    const path = "/frontoffice/api/info/";
    const url = this.resolveURL(path);
    const instruments = (await this.fetch(url)) as ISupportedInstruments;
    return instruments;
  }

  /**
   * Get the list of all supported assets
   */
  public async getAssets(): Promise<ISupportedAssets> {
    const path = "/frontoffice/api/assets-info/";
    const url = this.resolveURL(path);
    const assets = (await this.fetch(url)) as ISupportedAssets;
    return assets;
  }

  /**
   * Get the list of all supported instruments
   */
  public async getListOfInstruments(): Promise<string[]> {
    const path = "/marketdata/instruments/";
    const url = this.resolveURL(path);
    const instruments = (await this.fetch(url)) as string[];
    return instruments;
  }

  /**
   * Get the order book snapshot
   */
  public async getOrderBookSnapshot({
    instrument,
  }: IOrderBookSnapshotOptions): Promise<IOrderBookSnapshot> {
    const path = `/marketdata/instruments/${instrument}/depth/`;
    const url = this.resolveURL(path);
    const snapshot = (await this.fetch(url)) as IOrderBookSnapshot;
    return snapshot;
  }

  /**
   * Get historic rates
   */
  public async getCandles({
    instrument,
    ...qs
  }: ICandlesOptions): Promise<ICandlesResponse> {
    const path = `/marketdata/instruments/${instrument}/history/`;
    const url = this.resolveURL(path);
    PublicClient.setQuery(url, { ...qs });
    const candles = (await this.fetch(url)) as ICandlesResponse;
    return candles;
  }

  /**
   * Get tiers
   */
  public async getTiers(): Promise<ITiersInfo> {
    const path = "/frontoffice/api/tiers-info/";
    const url = this.resolveURL(path);
    const tiers = (await this.fetch(url)) as ITiersInfo;
    return tiers;
  }

  /**
   * Get the root asset
   */
  public async getRootAsset(): Promise<IRootAsset> {
    const path = "/marketdata/info/root-asset/";
    const url = this.resolveURL(path);
    const asset = (await this.fetch(url)) as IRootAsset;
    return asset;
  }

  /**
   * Make a request and parse the body as JSON
   */
  public async fetch(
    url: string | URL,
    { headers, ...options }: fetch.RequestInit = {}
  ): Promise<unknown> {
    const jsonHeaders = new fetch.Headers(headers);
    jsonHeaders.set("Content-Type", "application/json");
    const response = await PublicClient.fetch(url, {
      headers: jsonHeaders,
      ...options,
    });
    return response;
  }

  private resolveURL(path: string): URL {
    const url = new URL(this.url.toString());
    url.pathname += path.substring(1);
    return url;
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
      if (typeof value !== "undefined") {
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
      throw new FetchError((error as Error).message, response);
    }
  }
}
