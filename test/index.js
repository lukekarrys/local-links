var test = require('tape');
var localLinks = require('../local-links');
var domready = require('domready');
var partial = require('lodash.partial');

function $(id) {
    return document.getElementById(id);
}

function e(id) {
    return {target: $(id)};
}

function setup() {
    var container = document.createElement('div');
    container.id = 'container';
    container.innerHTML = [
        '<a id="local" href="/local/page/1">Local</a>',
        '<a id="local2" href="/local/page/1">Local2</a>',
        '<a id="local3" href="/local/page/1">Local3</a>',
        '<a id="local-search" href="/local/page/1?param=2">Search</a>',
        '<a id="relative" href="page-2">Relative</a>',
        '<a id="global" href="http://google.com/page/number/1">Global</a>',
        '<a href="/local/page/1"><span id="local-nested">Nested</span></a>',
        '<a id="empty-in-page-hash" href="#">Empty Hash</a>',
        '<a id="in-page-hash" href="#modal">Hash</a>',
        '<a id="out-of-page-hash" href="/local/page/1#two">Out of Page hash</a>',
        '<a id="global-hash" href="http://google.com/#hash">Global Hash</a>',
        '<a id="active" href="' + window.location.pathname + '"">Active</a>',
        '<span id="no-anchor">No anchor</span>',
        '<a id="local-blank" href="/local/page/1" target="_blank">Local Blank</a>',
        '<a id="local-blank-hash" href="#modal2" target="_blank">Local Blank Hash</a>'
    ].join('');
    document.body.appendChild(container);
}

function triggerClick(el, modified, button){
    var ev;
    if (button === undefined) {
        button = 0; /*left*/
    }
    if (document.createEvent) {
        ev = document.createEvent("MouseEvent");
        ev.initMouseEvent(
            "click",
            true /* bubble */,
            true /* cancelable */,
            window, null,
            0, 0, 0, 0, /* coordinates */
            !!modified, false, false, false, /* modifier keys */
            button,
            null
        );
        el.dispatchEvent(ev);
    } else if (document.createEventObject) {
        ev = document.createEventObject();
        ev.ctrlKey = !!modified;
        ev.button = button;
        el.dispatchEvent('onclick', ev);
    }
}

function attachClick(el, fn) {
    if (el.addEventListener) {
        el.addEventListener('click', fn, false); 
    } else if (el.attachEvent)  {
        el.attachEvent('onclick', fn);
    }
}

domready(function () {
    setup();

    function _pathnameTest(method, t) {
        var a = $('local');
        var search = $('local-search');
        var outHash = $('out-of-page-hash');
        var span = $('local-nested');
        var global = $('global');
        var relative = $('relative');
        var noAnchor = $('no-anchor');
        var localBlank = $('local-blank');

        t.plan(8);

        t.equal(localLinks[method](a), '/local/page/1');
        t.equal(localLinks[method](span), '/local/page/1');
        t.equal(localLinks[method](search), '/local/page/1?param=2');
        t.equal(localLinks[method](outHash), '/local/page/1#two');
        t.equal(localLinks[method](global), null);
        t.equal(localLinks[method](relative), '/page-2');
        t.equal(localLinks[method](noAnchor), null);
        t.equal(localLinks[method](localBlank), null);

        t.end();
    }
    // Use this test for both pathname alias functions
    test('HTML elements return pathname or null', partial(_pathnameTest, 'pathname'));
    test('HTML elements return pathname or null', partial(_pathnameTest, 'getLocalPathname'));

    test('Can be called with different context', function (t) {
        var pathname = localLinks.pathname;
        var hash = localLinks.hash;
        var active = localLinks.active;
        t.plan(3);
        t.equal(pathname($('local')), '/local/page/1');
        t.equal(hash($('in-page-hash')), '#modal');
        t.equal(active($('active')), true);
        t.end();
    });

    test('Works if the argument is an event with a target', function (t) {
        var ev = e('local');
        var nestedEvent = e('local-nested');
        var globalEvent = e('global');

        t.plan(3);

        t.equal(localLinks.pathname(ev), '/local/page/1');
        t.equal(localLinks.pathname(nestedEvent), '/local/page/1');
        t.equal(localLinks.pathname(globalEvent), null);

        t.end();
    });

    test('Ignores modified events for a valid anchor', function (t) {
        var ev = e('local');
        ev.shiftKey = true;
        
        t.plan(1);

        t.equal(localLinks.pathname(ev, $('local')), null);

        t.end();
    });

    test('Will use anchor from second arg', function (t) {
        var globalEvent = e(global);
        var globalA = $('global');
        var localA = $('local-nested');

        t.plan(3);

        t.equal(localLinks.pathname(globalEvent, localA), '/local/page/1');
        t.equal(localLinks.pathname(globalA, localA), '/local/page/1');
        t.equal(localLinks.pathname(localA, globalA), null);

        t.end();
    });

    function _hashTest(method, t) {
        var hash = $('in-page-hash');
        var emptyHash = $('empty-in-page-hash');
        var globalHash = $('global-hash');
        var targetBlankHash = $('local-blank-hash');

        t.plan(7);

        t.equal(localLinks.pathname(hash), null);
        t.equal(localLinks.pathname(emptyHash), null);
        t.equal(localLinks.pathname(targetBlankHash), null);

        t.equal(localLinks[method](hash), '#modal');
        t.equal(localLinks[method](emptyHash), '#');
        t.equal(localLinks[method](targetBlankHash), null);
        t.equal(localLinks[method](globalHash), null);

        t.end();
    }
    // Use this test for both hash alias functions
    test('Test hash links', partial(_hashTest, 'hash'));
    test('Test hash links', partial(_hashTest, 'getLocalHash'));

    function _activeTest(method, t) {
        t.plan(5);

        t.equal(localLinks[method]($('active')), true);
        t.equal(localLinks[method]($('global')), false);
        t.equal(localLinks[method]($('local')), false);
        t.equal(localLinks[method]($('local'), '/local/page/1'), true);
        t.equal(localLinks[method]($('in-page-hash')), false);

        t.end();
    }
    // Use this test for both active alias functions
    test('Active returns boolean based on current page', partial(_activeTest, 'active'));
    test('Active returns boolean based on current page', partial(_activeTest, 'isActive'));

    test('Return null for garbage', function (t) {
        t.plan(8);

        t.equal(localLinks.pathname(null), null);
        t.equal(localLinks.pathname($('whoops')), null);
        t.equal(localLinks.pathname({}, {}, {}, true), null);
        t.equal(localLinks.pathname('hey'), null);
        t.equal(localLinks.pathname(false), null);
        t.equal(localLinks.hash({}), null);
        t.equal(localLinks.hash('hey'), null);
        t.equal(localLinks.hash(false), null);

        t.end();
    });

    test('Works on link clicks', function (t) {
        var local = $('local');
        var global = $('global');
        var plan = 2;
        var count = 0;
        var end = function () {
            count++;
            if (count === plan) {
                t.end();
            }
        };

        t.plan(plan);

        attachClick(local, function (event) {
            event.preventDefault();
            t.equal(localLinks.pathname(event), '/local/page/1');
            end();
        });

        attachClick(global, function (event) {
            event.preventDefault();
            t.equal(localLinks.pathname(event), null);
            end();
        });

        triggerClick(local);
        triggerClick(global);
    });

    test('Works on modified link clicks', function (t) {
        var local = $('local2');
        var plan = 1;
        var count = 0;
        var end = function () {
            count++;
            if (count === plan) {
                t.end();
            }
        };

        t.plan(plan);

        attachClick(local, function (event) {
            event.preventDefault();
            t.equal(localLinks.pathname(event), null);
            end();
        });

        triggerClick(local, true);
    });

    test('Ignores middle clicks', function (t) {
        var local = $('local3');
        var plan = 1;
        var count = 0;
        var end = function () {
            count++;
            if (count === plan) {
                t.end();
            }
        };

        t.plan(plan);

        attachClick(local, function(event) {
          event.preventDefault();
          t.equal(localLinks.pathname(event), null, 'should ignore middle-button clicks');
        });

        triggerClick(local, false, 1);
    });
});
