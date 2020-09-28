import assert from "assert";
import fetch from "node-fetch";
import { FetchError } from "../";

suite("FetchError", () => {
  test("constructor", () => {
    const response = new fetch.Response();
    const message = "Some error message";

    const error = new FetchError(message, response);

    assert.deepStrictEqual(error.message, message);
    assert.deepStrictEqual(error.name, "FetchError");
    assert.deepStrictEqual(error.response, response);
  });
});
