import assert from "assert";
import nock from "nock";
import fetch from "node-fetch";

import {
  PublicClient,
  FetchError,
  ISupportedInstruments,
  ISupportedAssets,
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
    nock(url).get(`/frontoffice/api/info`).delay(1).reply(200, response);

    const accounts = await client.getInstruments();
    assert.deepStrictEqual(accounts, response);
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
    nock(url).get(`/frontoffice/api/assets-info`).delay(1).reply(200, response);

    const accounts = await client.getAssets();
    assert.deepStrictEqual(accounts, response);
  });

  test(".fetch() (passes headers)", async () => {
    const response = { ok: 1 };
    const reqheaders = { "Content-Type": "application/json" };

    nock(url, { reqheaders }).get("/").delay(1).reply(200, response);

    const data = await client.fetch("/");

    assert.deepStrictEqual(data, response);
  });

  test(".fetch() (pathname starts with no slash)", async () => {
    const response = { ok: 1 };
    const reqheaders = { "Content-Type": "application/json" };

    nock(url, { reqheaders }).get("/").delay(1).reply(200, response);

    const data = await client.fetch("");

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
