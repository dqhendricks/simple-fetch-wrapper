/*
    usage example:

    import * as client from "./Client";

    client.request('login', {body: {username, password}}).then(
        data => {
            console.log('here the logged in user data', data);
        },
        error => {
            console.error('oh no, login failed', error);
        },
    );
*/

const API_BASE_URL = "https://dustinhendricks.com";
const LOCAL_STORAGE_KEY = "__dustin_hendricks_token__"; // storage key for API authentication tokens

export function request(endpoint, { body, ...customConfig } = {}) {
  const token = localStorage.getItem(LOCAL_STORAGE_KEY);
  const headers = {};
  // allow both FormData or Object fetch requests
  if (body && body instanceof FormData !== true) {
    body = JSON.stringify(body);
    headers["content-type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const config = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  return fetch(`${API_BASE_URL}/${endpoint}`, config).then(async (response) => {
    if (response.status === 401) {
      logout();
      window.location.assign(window.location);
      return;
    }
    if (response.ok) {
      return await response.json();
    } else {
      const errorMessage = await response.text();
      return Promise.reject(new Error(errorMessage));
    }
  });
}

export function login(token) {
  localStorage.setItem(LOCAL_STORAGE_KEY, token);
}

export function logout() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

export function isLoggedIn() {
  return localStorage.getItem(LOCAL_STORAGE_KEY) === null;
}

export function formDataToObject(formData) {
  // does not support multi-dimensional arrays
  const objectData = {};
  formData.keys().forEach((key) => {
    const allItems = formData.getAll(key);
    objectData[key] = allItems.length > 1 ? allItems : allItems[0];
  });
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
