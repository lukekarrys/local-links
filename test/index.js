var test = require('tape');
var localLinks = require('../local-links');
var domready = require('domready');


function setup(html) {
    var container = document.createElement('div');
    container.id = 'container';
    container.innerHTML = [
        '<a id="local" href="/local/page/1">Local</a>',
        '<a id="relative" href="page-2">Relative</a>',
        '<a id="global" href="http://google.com/page/number/1">Global</a>',
        '<a href="/local/page/1"><span id="local-nested">Nested</span></a>',
        '<a id="empty-in-page-hash" href="#">Empty Hash</a>',
        '<a id="in-page-hash" href="#modal">Hash</a>',
        '<a id="global-hash" href="http://google.com/#hash">Global Hash</a>',
        '<a id="active" href="/">Active</a>',
    ].join('');
    document.body.appendChild(container);
}

function $(id) {
    return document.getElementById(id);
}

function e(id) {
    return {
        target: $(id)
    };
}

domready(function () {
    setup();

    test('HTML elements return pathname or null', function (t) {
        var a = $('local');
        var span = $('local-nested');
        var global = $('global');
        var relative = $('relative');

        t.plan(4);

        t.equal(localLinks.pathname(a), '/local/page/1');
        t.equal(localLinks.pathname(span), '/local/page/1');
        t.equal(localLinks.pathname(global), null);
        t.equal(localLinks.pathname(relative), '/page-2');

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

    test('Will use first anchor param first if it exists', function (t) {
        var globalEvent = e(global);
        var globalA = $('global');
        var localA = $('local-nested');

        t.plan(3);

        t.equal(localLinks.pathname(globalEvent, localA), '/local/page/1');
        t.equal(localLinks.pathname(globalA, localA), null);
        t.equal(localLinks.pathname(localA, globalA), '/local/page/1');

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
});
