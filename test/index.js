var test = require('tape');
var localLinks = require('../local-links');
var domready = require('domready');

function $(id) {
    return document.getElementById(id);
}

function e(id) {
    return {
        target: $(id)
    };
}

function setup(html) {
    var container = document.createElement('div');
    container.id = 'container';
    container.innerHTML = [
        '<a id="local" href="/local/page/1">Local</a>',
        '<a id="local2" href="/local/page/1">Local2</a>',
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
        '<a id="local-blank-hash" href="#modal2" target="_blank">Local Blank Hash</a>',
    ].join('');
    document.body.appendChild(container);
}

function triggerClick(el, modified){
    var ev;
    if (document.createEvent) {
        ev = document.createEvent("MouseEvent");
        ev.initMouseEvent(
            "click",
            true /* bubble */,
            true /* cancelable */,
            window, null,
            0, 0, 0, 0, /* coordinates */
            !!modified, false, false, false, /* modifier keys */
            0 /*left*/,
            null
        );
        el.dispatchEvent(ev);
    } else if (document.createEventObject) {
        ev = document.createEventObject();
        ev.ctrlKey = !!modified;
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

    test('HTML elements return pathname or null', function (t) {
        var a = $('local');
        var search = $('local-search');
        var outHash = $('out-of-page-hash');
        var span = $('local-nested');
        var global = $('global');
        var relative = $('relative');
        var noAnchor = $('no-anchor');
        var localBlank = $('local-blank');

        t.plan(8);

        t.equal(localLinks.pathname(a), '/local/page/1');
        t.equal(localLinks.pathname(span), '/local/page/1');
        t.equal(localLinks.pathname(search), '/local/page/1?param=2');
        t.equal(localLinks.pathname(outHash), '/local/page/1#two');
        t.equal(localLinks.pathname(global), null);
        t.equal(localLinks.pathname(relative), '/page-2');
        t.equal(localLinks.pathname(noAnchor), null);
        t.equal(localLinks.pathname(localBlank), null);

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

    test('Test hash links', function (t) {
        var hash = $('in-page-hash');
        var emptyHash = $('empty-in-page-hash');
        var globalHash = $('global-hash');
        var targetBlankHash = $('local-blank-hash');

        t.plan(7);

        t.equal(localLinks.pathname(hash), null);
        t.equal(localLinks.pathname(emptyHash), null);
        t.equal(localLinks.pathname(targetBlankHash), null);

        t.equal(localLinks.hash(hash), '#modal');
        t.equal(localLinks.hash(emptyHash), '#');
        t.equal(localLinks.hash(targetBlankHash), null);

        t.equal(localLinks.hash(globalHash), null);

        t.end();
    });

    test('Test hash links', function (t) {
        var hash = $('in-page-hash');
        var emptyHash = $('empty-in-page-hash');
        var globalHash = $('global-hash');

        t.plan(5);

        t.equal(localLinks.pathname(hash), null);
        t.equal(localLinks.pathname(emptyHash), null);

        t.equal(localLinks.hash(hash), '#modal');
        t.equal(localLinks.hash(emptyHash), '#');

        t.equal(localLinks.hash(globalHash), null);

        t.end();
    });

    test('Active returns boolean based on current page', function (t) {
        t.plan(5);

        t.equal(localLinks.active($('active')), true);
        t.equal(localLinks.active($('global')), false);
        t.equal(localLinks.active($('local')), false);
        t.equal(localLinks.active($('local'), '/local/page/1'), true);
        t.equal(localLinks.active($('in-page-hash')), false);

        t.end();
    });

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
});
