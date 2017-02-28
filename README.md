# fn-cache-wrapper

Apply [fn-cache](https://github.com/alejorod/cache) to all functions of an object.

# Usage

## Installation

```bash
npm install --save fn-cache-wrapper
```

## Wrap

`wrap` returns a new object with cached versions of another objects functions. Works for regular objects and ES6 classes.

```js
const { wrap } = require('fn-cache-wrapper');

class ApiClient {

  things() {
    return request('http://api.domain.com/things');
  }
  
}

let client = new ApiClient();
let cachedClient = wrap(client, { lifetime: 2000 });

// response will be cached
cachedClient.things();
``` 

`wrap` is useful when you need want to deduplicate all client calls within a request without needing to manage a separate cache. Just wrap the client and at the end of the request throw the wrapper away.

## Replace

`replace` replaces all the functions on an object with cached versions.

```js
const { replace } = require('fn-cache-wrapper');

class ApiClient {

  things() {
    return request('http://api.domain.com/things');
  }
  
}

let client = new ApiClient();
replace(client, { lifetime: 2000 });

// response will be cached
client.things();
```

`replace` is useful when you want default caching behavior for a client always.

## Clearing caches

You can clear the function cache manually just like with [fn-cache](https://github.com/alejorod/cache) for both `wrap` and `replace`.

```js
let client = wrap(new ApiClient(), { lifetime: 2000 });
client.things();
client.things.clearCache();
```

## Configuration

### Deep caching *[`wrap`]*

When using `wrap` the object being wrapped may call other functions defined on itself.

```js
class ApiClient {

  me() {
    return request('http://api.domain.com/users/me');
  }

  myThings() {
    return this.me()
      .then(id => request(`http://api.domain.com/users/${id}/things`);
  }
  
}
```

By default `wrap` will bind the functions being cached such that calls like `this.me()` will go to the cached version and not the uncached version. This can be disabled by passing `{ deep: false }` when creating the wrapper.

```js
const { wrap } = require('fn-cache-wrapper');

let client = new ApiClient();
let cached = wrap(new ApiClient(), { lifetime: 2000, deep: false });

client.me();         // now there is a cached result
client.me();         // will get the cached result
client.myThings();   // will not use the cached 'me()' result.
```

### Property copying *[`wrap`]*

When using `wrap` property values are **copied** from the original object.

```js
const { wrap } = require('fn-cache-wrapper');

class ApiClient {

  constructor() {
    this.host = 'http://api.domain.com';
  }

  me() {
    return request(`${this.host}/users/me`);
  }
  
}

let client = new ApiClient();
let cached = wrap(new ApiClient(), { lifetime: 2000 });


cached.me()   // access to 'this.host' will work

client.host = 'http://api-2.domain.com';
client.me.clearCache();
client.me()   // still using 'http://api.domain.com'
```

Property copying can be turned off be passing  `{ props: false }` in the options.

### Excluding functions *[`wrap`, `replace`]*

An array of function names can be passed under the `exclude` option to skip caching.

```js
const { wrap } = require('fn-cache-wrapper');

let client = new ApiClient();
let cached = wrap(new ApiClient(), { lifetime: 2000, exclude: ['me'] });

client.me();         // will not be cached
client.myThings();   // the result of 'myThings()' will be cached
```

### No binding *[`wrap`, `replace`]*

If you do not want the functions to be bound to the containing object use the `{ bind: false }` option. Obviously this is only useful when you *want* the `this` reference to be context specific and not in the class examples used thus far.


```js
const { wrap } = require('fn-cache-wrapper');

let client = new ApiClient();
let cached = wrap(new ApiClient(), { lifetime: 2000, bind: false });

client.me();         // works as normal
client.myThings();   // will fail with a TypeError as 'this' is undefined.
```
