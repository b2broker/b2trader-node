import assert from "assert";
import nock from "nock";
import fetch from "node-fetch";

import {
  PublicClient,
  FetchError,
  ISupportedInstruments,
  ISupportedAssets,
  IOrderBookSnapshot,
} from "../";

const url = "https://api.some-b2trader.exchange:9876/trading/1.1/";

const client = new PublicClient({ url });

suite("PublicClient", () => {
  test("constructor", () => {
    assert.deepStrictEqual(client.url, new URL(url));
  });

  test("constructor (adds the missing slash)", () => {
    const url = "https://api.some-b2trader.exchange:9876/trading/1.1";
    const client = new PublicClient({ url });
    assert.deepStrictEqual(client.url, new URL(`${url}/`));
  });

  test(".getInstruments()", async () => {
    const response: ISupportedInstruments = {
      serverTime: 637368932194030800,
      pairs: {
        btc_eur: {
          baseAsset: "btc",
          quoteAsset: "eur",
          hidden: 0,
          makerFee: 0.0025,
          makerFeeLimit: 0,
          takerFee: 0.0028,
          takerFeeLimit: 0,
          priceScale: 8,
          amountScale: 8,
          createdAt: "2019-11-21T12:08:33.980784",
          updatedAt: "2019-11-21T12:08:33.980784",
          status: "Open",
        },
      },
    };
    nock(url).get(`/frontoffice/api/info/`).delay(1).reply(200, response);

    const instruments = await client.getInstruments();
    assert.deepStrictEqual(instruments, response);
  });

  test(".getAssets()", async () => {
    const response: ISupportedAssets = {
      data: [
        {
          id: "usd",
          can_deposit: true,
          can_withdraw: true,
          asset_name: "USD",
          withdrawal_fee: 0,
          scale: 8,
        },
        {
          id: "btc",
          can_deposit: true,
          can_withdraw: true,
          asset_name: "Bitcoin",
          withdrawal_fee: 0,
          scale: 8,
        },
      ],
    };
    nock(url)
      .get(`/frontoffice/api/assets-info/`)
      .delay(1)
      .reply(200, response);

    const assets = await client.getAssets();
    assert.deepStrictEqual(assets, response);
  });

  test(".getListOfInstruments()", async () => {
    const response: string[] = ["eur_usdt"];
    nock(url).get(`/marketdata/instruments/`).delay(1).reply(200, response);

    const instruments = await client.getListOfInstruments();
    assert.deepStrictEqual(instruments, response);
  });

  test(".getOrderBookSnapshot()", async () => {
    const instrument = "btc_usd";
    const response: IOrderBookSnapshot = {
      instrument: "btc_usd",
      bids: [{ amount: 0.19969415, price: 10861.173774 }],
      asks: [{ amount: 0.3136669, price: 10865.246416 }],
      version: 509444497,
      askTotalAmount: 152.30721241,
      bidTotalAmount: 123.3206466,
      snapshot: true,
    };
    nock(url)
      .get(`/marketdata/instruments/${instrument}/depth/`)
      .delay(1)
      .reply(200, response);

    const snapshot = await client.getOrderBookSnapshot({ instrument });
    assert.deepStrictEqual(snapshot, response);
  });

  test(".fetch() (passes headers)", async () => {
    const response = { ok: 1 };
    const reqheaders = { "Content-Type": "application/json" };

    nock(url, { reqheaders }).get("/").delay(1).reply(200, response);

    const data = await client.fetch(url);

    assert.deepStrictEqual(data, response);
  });

  suite("Static methods", () => {
    test(".setQuery()", () => {
      const newUrl = new URL(url);
      PublicClient.setQuery(newUrl, { a: undefined });
      assert.deepStrictEqual(newUrl.href, `${url}`);
      PublicClient.setQuery(newUrl, { a: 1 });
      assert.deepStrictEqual(newUrl.href, `${url}?a=1`);
      PublicClient.setQuery(newUrl, { a: "" });
      assert.deepStrictEqual(newUrl.href, `${url}?a=`);
      PublicClient.setQuery(newUrl, { b: "1" });
      assert.deepStrictEqual(newUrl.href, `${url}?a=&b=1`);
    });

    test(".fetch()", async () => {
      const response = { ok: 1 };

      nock(url).get("/").delay(1).reply(200, response);

      const data = await PublicClient.fetch(url);

      assert.deepStrictEqual(data, response);
    });

    test(".fetch() (throws `FetchError` on non 2xx responses)", async () => {
      nock(url).get("/").delay(1).reply(404);

      try {
        await PublicClient.fetch(url);
        assert.fail("Should throw a FetchError");
      } catch (error) {
        assert.ok(error instanceof FetchError);
        assert.ok(error.response instanceof fetch.Response);
      }
    });

    test(".fetch() (throws `FetchError` on non json reposonses)", async () => {
      nock(url).get("/").delay(1).reply(200, "notjson");

      try {
        await PublicClient.fetch(url);
        assert.fail("Should throw a FetchError");
      } catch (error) {
        assert.ok(error instanceof FetchError);
        assert.ok(error.response instanceof fetch.Response);
      }
    });
  });
});
