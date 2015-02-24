local-links
===========

Determine cross-browser if an event or anchor element should be handled locally.

[![NPM](https://nodei.co/npm/local-links.png)](https://nodei.co/npm/local-links/)

[![Build Status](https://travis-ci.org/lukekarrys/local-links.png?branch=master)](https://travis-ci.org/lukekarrys/local-links)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/lukekarrys-loclinks.svg)](https://saucelabs.com/u/lukekarrys-loclinks)

## Install

`npm install local-links --save`

## Why?

Browsers have quirks. Knowing if a link is local should be easy, since we
just want to know if the hosts are the same. But this can be difficult because
of the aforementioned browser quirks. A few of them:

- IE9 will add `:80` to the host of an anchor, but not the window
- IE9 wont put a leading slash on the pathname of an anchor, but will on the window
- Chrome 36 will report anchor.hash as '' if it has `href="#"`
- More? Please report test cases!

Because of that and a few other things I was doing all the time, such as
finding the closest anchor to an element based on an event object, I decided
it would be a good module (that at least I would use all the time).

## Usage

```html
<a href='/page2' id="local">Local</a>
<a href='#hash' id="hash">Local</a>
<a href='http://google.com' id="google">Google</a>
```

```js
var local = require('local-links');

// `pathname()` will return the pathname as a string
// if the link is local, otherwise it will return null
local.pathname(document.getElementById('local')) // '/page2'
local.pathname(document.getElementById('hash')) // null
local.pathname(document.getElementById('google')) // null

// `hash()` will return the hash as a string
// if the hash is to this page, otherwise it will return null
local.hash(document.getElementById('local')) // null
local.hash(document.getElementById('hash')) // '#hash'
local.hash(document.getElementById('google')) // null
```


## API


### Methods

#### `getLocalPathname(Event or HTMLElement [, HTMLElement])`

Returns the pathname if it is a non-hash local link, or null if it is not.
Always includes the leading `/`.

*Alias: `pathname`*

#### `getLocalHash(Event or HTMLElement [, HTMLElement])`

Returns the hash if it is an in-page hash link, or null if it is not. Always
includes the leading `#`.

*Alias: `hash`*

#### `isActive(Event or HTMLElement [, String comparePath])`

Returns true/false depending on if the anchor pathname is equal to the `comparePath`
(which defaults to `window.location.pathname`). Calls `pathname()` internally.

*Alias: `active`*

#### `isLocal(event, anchor, [, Boolean lookForHash])`

Returns the pathname (or hash if `lookForHash` is true) for local links, or null
if it is not. This is used by `pathname()` and `hash()` under the hood. The main
difference here is that you need to specify the `event` and `anchor` yourself, and
the `anchor` wont be looked up from `event.target` like it would from the other methods.


#### Supply either Event or HTMLElement

The above methods will accept an `Event` object, like the one you get from
click event handlers, or any `HTMLElement`. You can also supply an `Event` object
and a different `HTMLElement` as the second parameter and it will take precedence.

If only an `Event` object is supplied, the `HTMLElement` will be found from
`Event.target`.


#### Nested HTML Elements

In the case that any `HTMLElement` your provide is not an anchor
element, the module will look up `parentNodes` until an anchor is found.


#### Events

If an `Event` object is supplied, all methods will return `null` if any of the following
are true `altKey`, `ctrlKey`, `metaKey`, `shiftKey`. This is because you almost always
want to treat modified click events as external page clicks.


#### `target="_blank"`

If the anchor has target="_blank" it will return `null` for both the `pathname()` and
`hash()` methods.


#### Hash links

Using the `pathname` method will return null for hash links that do not point
to a different page. To get the hash for one of these links use the `hash()` method.


### Tests

Run `npm start` and open [`http://localhost:3000`](http://localhost:3000) to run the tests in your browser.

It is also a good idea to run `sudo npm run start-80` (requires admin) which will run the tests on [`http://localhost`](http://localhost)
because there can be unexpected behavior when the host has no port in [IE9](https://github.com/lukekarrys/local-links/blob/master/local-links.js#L26) and [IE10](https://github.com/lukekarrys/local-links/blob/master/local-links.js#L28).

To run the tests in the cli, just run `npm test`.


#### License

MIT
