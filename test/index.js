var test = require('tape');
var localLinks = require('../local-links');

function createA(href) {
    var a = document.createElement('a');
    var text = document.createTextNode('text text');
    a.setAttribute('href', href);
    a.appendChild(text);
    return a;
}

function createEvent(href) {
    return {
        target: createA(href)
    };
}

function createNestedA(href) {
    var a = createA(href);
    var span = document.createElement('span');
    var spanText = document.createTextNode('text text');
    span.appendChild(spanText);
    a.appendChild(span);
    return span;
}

test('A local link returns a pathname', function (t) {
    var a = createA('/page/number/1');
    t.equal(localLinks.pathname(a), '/page/number/1');
    t.end();
});

test('A non-local link returns null', function (t) {
    var a = createA('http://google.com/page/number/1');
    t.equal(localLinks.pathname(a), null);
    t.end();
});

test('A non-local link returns null', function (t) {
    var a = createNestedA('/page/number/1');

    // console.log(a)
    // console.log(a.tagName)
    // console.log(a.parentNode)

    t.equal(localLinks.pathname(a), '/page/number/1');
    t.end();
});
