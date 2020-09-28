import type { Response } from "node-fetch";

export class FetchError extends Error {
  readonly #response: Response;

  public readonly name = "FetchError";

  public constructor(message: string, response: Response) {
    super(message);
    this.#response = response;
  }

  public get response(): Response {
    return this.#response;
  }
}

export default FetchError;
