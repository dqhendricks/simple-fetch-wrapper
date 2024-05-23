# simple-fetch-wrapper
This JS utility module abstracts away some of the common additional fetch-related code.

* Passes unexpected errors back as error Promise rejections.
* Seamlessly allows both object or FormData request bodies.
* Auto sets content-type header when body set to object.
* Auto-selects GET or POST based on existence of body, if not already set in the config argument.
* Set and automatically use bearer tokens (uses local storage, so must safeguard against XXS attacks).
* Register universal status handlers to handle things like 401 (unauthorized request) responses.
* Register response interceptors to universally handle certain data in responses.
* Conversion utilities for FormData->Object and Object->FormData.

**Usage examples:**

```
// basic usage
import * as client from "./Client.ts";

client.request('login', {body: {username, password}}).then(
    data => {
        console.log('here the logged in user data', data);
    },
    error => {
        console.error('oh no, login failed', error);
    },
);
```

```
// set status handlers and interceptors
import * as client from "./Client.ts";

client.addStatusHandler(401, () => {
  // unauthorized request
  // do something like set isAuthenticated to false in global state here
});

client.addResponseInterceptor((data) => {
  // check response data for all requests to handle certain data in responses
  // code could easily be modified to run universal data conversions as well, but would then require you to return data from all handlers
}
```
