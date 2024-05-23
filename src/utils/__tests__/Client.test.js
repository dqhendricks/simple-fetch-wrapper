import { describe, test, expect, vi } from "vitest";

import * as client from "../client";

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

vi.spyOn(window, "fetch").mockImplementation((endpoint, config) => {
  switch (endpoint) {
    case "https://exampledomain.com/success":
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fakeApiData),
      });
    case "https://exampledomain.com/failure":
      return Promise.resolve({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Page not found."),
      });
    case "https://exampledomain.com/unauthorized":
      return Promise.resolve({
        ok: false,
        status: 401,
      });
  }
});

describe("Client.js utility", () => {
  // fetching

  test("Basic fetch success.", async () => {
    const data = await client.fetch("success");
    expect(data).toEqual(fakeApiData);
  });

  test("Basic fetch failure (404).", async () => {
    await expect(client.fetch("failure")).rejects.toThrow("Page not found.");
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
