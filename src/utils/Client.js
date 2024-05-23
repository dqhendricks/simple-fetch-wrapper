/*
    usage example:

    import * as client from "./client";

    client.fetch('login', {body: {username, password}}).then(
        data => {
            console.log('here the logged in user data', data);
        },
        error => {
            console.error('oh no, login failed', error);
        },
    );
*/

const API_BASE_URL = "https://exampledomain.com";
const LOCAL_STORAGE_KEY = "__your_site_token__"; // storage key for API authentication tokens

const statusHandlers = {};
const responseInterceptors = [];

export function fetch(endpoint, { body, ...customConfig } = {}) {
  // add bearer token if exists
  const token = localStorage.getItem(LOCAL_STORAGE_KEY);
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const config = {
    method: body ? "POST" : "GET", // auto set method if not set in config
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };
  // allow both FormData or Object fetch requests
  if (body) {
    if (body instanceof FormData !== true) {
      body = JSON.stringify(body);
      headers["content-type"] = "application/json";
    }
    config.body = body;
  }

  return window
    .fetch(`${API_BASE_URL}/${endpoint}`, config)
    .then(async (response) => {
      // execute any set status handlers for expected errors
      if (Object.hasOwn(statusHandlers, response.status.toString())) {
        statusHandlers[response.status.toString()]();
        return await response.json();
      }
      if (response.ok) {
        // success
        const data = await response.json();
        // execute any set response interceptors
        responseInterceptors.forEach((interceptor) => interceptor(data));
        return data;
      } else {
        // unexpected error
        return Promise.reject(new Error(await response.text()));
      }
    });
}

export function setAuthToken(token) {
  localStorage.setItem(LOCAL_STORAGE_KEY, token);
}

export function formDataToObject(formData) {
  // does not support multi-dimensional arrays
  const objectData = {};
  for (const key of formData.keys()) {
    const allItems = formData.getAll(key);
    objectData[key] = allItems.length > 1 ? allItems : allItems[0];
  }
  return objectData;
}

export function objectToFormData(objectData) {
  // does not support multi-dimensional arrays
  var formData = new FormData();
  Object.entries(objectData).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((subValue) => formData.append(key, subValue));
    } else {
      formData.append(key, value);
    }
  });
  return formData;
}

// set status handlers to universally handle things like 401 unauthorized request responses
export function addStatusHandler(statusCode, handler) {
  statusHandlers[statusCode.toString()] = handler;
}

export function removeStatusHandler(statusCode) {
  delete statusHandlers[statusCode];
}

// add response interceptors to universally check for certain data in responses
export function addResponseInterceptor(interceptor) {
  responseInterceptors.push(interceptor);
}

export function removeResponseInterceptor(interceptor) {
  const index = responseInterceptors.indexOf(interceptor);
  if (index !== -1) responseInterceptors.splice(index, 1);
}
