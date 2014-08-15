function isHTMLElement(obj) {
    return obj && (typeof obj === 'object') &&
      (obj.nodeType === 1) && (typeof obj.style === 'object') &&
      (typeof obj.ownerDocument ==='object');
}

function isA(obj) {
    return isHTMLElement(obj) && obj.tagName === 'A';
}

function closestA(checkNode) {
    do {
        if (isA(checkNode)) {
            return checkNode;
        }
    } while ((checkNode = checkNode.parentNode));
}

function normalizeLeadingSlash(pathname) {
    if (pathname.charAt(0) !== '/') {
        pathname = '/' + pathname;
    }
    return pathname;
}

// [1] http://blogs.msdn.com/b/ieinternals/archive/2011/02/28/internet-explorer-window-location-pathname-missing-slash-and-host-has-port.aspx
// [2] https://github.com/substack/catch-links/blob/7aee219cdc2c845c78caad6070886a9380b90e4c/index.js#L13-L17

function isLocal(event, anchor, lookForHash) {
    event || (event = {});

    // Skip modifier events
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return null;
    }

    // Only test anchor elements
    if (!anchor || !isA(anchor)) {
        return null;
    }

    // IE9 doesn't put a leading slash on anchor.pathname [1]
    var aPathname = normalizeLeadingSlash(anchor.pathname);
    var wPathname = normalizeLeadingSlash(window.location.pathname);
    var aHost = anchor.host;
    var wHost = window.location.host;

    // Some browsers (Chrome 36) return an empty string for anchor.hash
    // even when href="#", so we also check the href
    var aHash = anchor.hash || (anchor.href.indexOf('#') > -1 ? '#' + anchor.href.split('#')[1] : null);
    var inPageHash;

    // Window has no port, but anchor does
    if (!window.location.port && anchor.port) {
        // IE9 sometimes includes the default port on anchor.host
        // so we append the default port to the window host in this case
        // so they will match for the host equality check [1]
        wHost += ':80';
    }

    // Hosts are the same, its a local link
    if (aHost === wHost) {

        // If everything else is the same
        // and hash exists, then it is an in-page hash [2]
        inPageHash =
            aPathname === wPathname &&
            anchor.search === window.location.search &&
            aHash;

        if (lookForHash === true) {
            // If we are looking for the hash then this will
            // only return a truthy value if the link
            // is an *in-page* hash link
            return inPageHash;
        } else {
            // If this is an in page hash link
            // then ignore it because we werent looking for hash links
            return inPageHash ?
                null :
                aPathname + (anchor.search || '') + (aHash || '');
        }
    }

    return null;
}

function getEventAndAnchor(arg1, arg2) {
    var ev = null;
    var anchor = null;

    // Two arguments will come in this order
    if (arguments.length === 2) {
        ev = arg1;
        anchor = arg2;
    }
    // If our first arg is an element
    // then use that as our anchor
    else if (isHTMLElement(arg1)) {
        anchor = arg1;
    }
    // Otherwise our argument is an event
    else {
        ev = arg1;
    }

    // If there is no anchor, but we have an event
    // then use event.target
    if (!anchor && ev && ev.target) {
        anchor = ev.target;
    }

    // Last, if our anchor is not an anchor,
    // see if we can find one in its parents
    if (anchor && !isA(anchor)) {
        anchor = closestA(anchor);
    }

    return [ev, anchor];
}

module.exports = {
    pathname: function () {
        return isLocal.apply(null, getEventAndAnchor.apply(null, arguments));
    },
    hash: function () {
        return isLocal.apply(null, getEventAndAnchor.apply(null, arguments).concat(true));
    },
    active: function () {
        var args = Array.prototype.slice.call(arguments);
        var last = args[args.length - 1];
        var checkPath = window.location.pathname;

        if (typeof last === 'string') {
            checkPath = last;
            args = args.slice(0, -1);
        }

        return this.pathname.apply(null, args) === normalizeLeadingSlash(checkPath);
    }
};
