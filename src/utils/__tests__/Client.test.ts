import { describe, test, expect, vi } from "vitest";

import * as client from "../Client.ts";

const defaultResponseObject = new Response();

const fakeApiData = {
  name: "Joni Baez",
  age: "32",
  address: "123, Charming Avenue",
};

const fakeFormDataRequest = new FormData();
fakeFormDataRequest.append("user", "john");
fakeFormDataRequest.append("password", "1234");
fakeFormDataRequest.append("options", "option 1");
fakeFormDataRequest.append("options", "option 2");

const fakeObjectRequest = {
  user: "john",
  password: "1234",
  options: ["option 1", "option 2"],
};

vi.spyOn(window, "fetch").mockImplementation(
  (
    endpoint: RequestInfo | URL,
    config: RequestInit | undefined,
  ): Promise<Response> => {
    switch (endpoint) {
      case "https://examplewebsite.com/success":
        return Promise.resolve({
          ...defaultResponseObject,
          ok: true,
          status: 200,
          json: () => Promise.resolve(fakeApiData),
        });
      case "https://examplewebsite.com/failure":
        return Promise.resolve({
          ...defaultResponseObject,
          ok: false,
          status: 404,
          text: () => Promise.resolve("Page not found."),
        });
      case "https://examplewebsite.com/unauthorized":
        return Promise.resolve({
          ...defaultResponseObject,
          ok: false,
          status: 401,
        });
    }
    return new Promise(() => {});
  },
);

describe("Client.js utility", () => {
  // fetching

  test("Basic fetch success.", async () => {
    const data = await client.request("success");
    expect(data).toEqual(fakeApiData);
  });

  test("Basic fetch failure (404).", async () => {
    await expect(client.request("failure")).rejects.toThrow("Page not found.");
  });

  // request conversions

  test("Convert FormData to javascript object.", () => {
    expect(client.formDataToObject(fakeFormDataRequest)).toEqual(
      fakeObjectRequest,
    );
  });

  test("Convert javascript object to FormData.", () => {
    expect(client.objectToFormData(fakeObjectRequest)).toEqual(
      fakeFormDataRequest,
    );
  });
});

vi.clearAllMocks();
