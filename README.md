# simple-fetch-wrapper
This utility module extracts away some of the common additional fetch-related code.

* Passes errors back as Promise rejections.
* Seamlessly allows both Object or FormData request bodies.
* Default headers.
* Auto-selects GET or POST based on existence of `body`, if not already set in the config argument.
* Simple login and logout functions.
* Local storage and automatic use of authentication tokens.
* Auto logout on 401 error response.
* Conversion utilities for FormData->Object and Object->FormData.

**Usage example:**

```
import * as client from "./Client";

client.request('login', {body: {username, password}}).then(
    data => {
        console.log('here the logged in user data', data);
    },
    error => {
        console.error('oh no, login failed', error);
    },
);
```
