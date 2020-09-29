'use strict';

var test = require('ava');
var sinon = require('sinon');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var test__default = /*#__PURE__*/_interopDefaultLegacy(test);

const {JSDOM} = require('jsdom');

const {window} = new JSDOM('…');
global.document = window.document;
global.Node = window.Node;
global.Element = window.Element;
global.DocumentFragment = window.DocumentFragment;
global.EventTarget = window.EventTarget;

var svgTagNames = [
	"a",
	"altGlyph",
	"altGlyphDef",
	"altGlyphItem",
	"animate",
	"animateColor",
	"animateMotion",
	"animateTransform",
	"animation",
	"audio",
	"canvas",
	"circle",
	"clipPath",
	"color-profile",
	"cursor",
	"defs",
	"desc",
	"discard",
	"ellipse",
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feDropShadow",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence",
	"filter",
	"font",
	"font-face",
	"font-face-format",
	"font-face-name",
	"font-face-src",
	"font-face-uri",
	"foreignObject",
	"g",
	"glyph",
	"glyphRef",
	"handler",
	"hkern",
	"iframe",
	"image",
	"line",
	"linearGradient",
	"listener",
	"marker",
	"mask",
	"metadata",
	"missing-glyph",
	"mpath",
	"path",
	"pattern",
	"polygon",
	"polyline",
	"prefetch",
	"radialGradient",
	"rect",
	"script",
	"set",
	"solidColor",
	"stop",
	"style",
	"svg",
	"switch",
	"symbol",
	"tbreak",
	"text",
	"textArea",
	"textPath",
	"title",
	"tref",
	"tspan",
	"unknown",
	"use",
	"video",
	"view",
	"vkern"
];

const svgTags = new Set(svgTagNames);
svgTags.delete('a');
svgTags.delete('audio');
svgTags.delete('canvas');
svgTags.delete('iframe');
svgTags.delete('script');
svgTags.delete('video');
// Copied from Preact
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
const isFragment = (type) => {
    return type === DocumentFragment;
};
const setCSSProps = (element, style) => {
    for (const [name, value] of Object.entries(style)) {
        if (name.startsWith('-')) {
            element.style.setProperty(name, value);
        }
        else if (typeof value === 'number' && !IS_NON_DIMENSIONAL.test(name)) {
            element.style[name] = `${value}px`;
        }
        else {
            element.style[name] = value;
        }
    }
};
const create = (type) => {
    if (typeof type === 'string') {
        if (svgTags.has(type)) {
            return document.createElementNS('http://www.w3.org/2000/svg', type);
        }
        return document.createElement(type);
    }
    if (isFragment(type)) {
        return document.createDocumentFragment();
    }
    return type(type.defaultProps);
};
const setAttribute = (element, name, value) => {
    if (value === undefined || value === null) {
        return;
    }
    // Naive support for xlink namespace
    // Full list: https://github.com/facebook/react/blob/1843f87/src/renderers/dom/shared/SVGDOMPropertyConfig.js#L258-L264
    if (/^xlink[AHRST]/.test(name)) {
        element.setAttributeNS('http://www.w3.org/1999/xlink', name.replace('xlink', 'xlink:').toLowerCase(), value);
    }
    else {
        element.setAttribute(name, value);
    }
};
const addChildren = (parent, children) => {
    for (const child of children) {
        if (child instanceof Node) {
            parent.appendChild(child);
        }
        else if (Array.isArray(child)) {
            addChildren(parent, child);
        }
        else if (typeof child !== 'boolean' &&
            typeof child !== 'undefined' &&
            child !== null) {
            parent.appendChild(document.createTextNode(child));
        }
    }
};
const h = (type, attributes, ...children) => {
    var _a;
    const element = create(type);
    addChildren(element, children);
    if (element instanceof DocumentFragment || !attributes) {
        return element;
    }
    // Set attributes
    for (let [name, value] of Object.entries(attributes)) {
        if (name === 'htmlFor') {
            name = 'for';
        }
        if (name === 'class' || name === 'className') {
            const existingClassname = (_a = element.getAttribute('class')) !== null && _a !== void 0 ? _a : '';
            setAttribute(element, 'class', (existingClassname + ' ' + String(value)).trim());
        }
        else if (name === 'style') {
            setCSSProps(element, value);
        }
        else if (name.startsWith('on')) {
            const eventName = name.slice(2).toLowerCase().replace(/^-/, '');
            element.addEventListener(eventName, value);
        }
        else if (name === 'dangerouslySetInnerHTML' && '__html' in value) {
            element.innerHTML = value.__html;
        }
        else if (name !== 'key' && value !== false) {
            setAttribute(element, name, value === true ? '' : value);
        }
    }
    return element;
};
// Improve TypeScript support for DocumentFragment
// https://github.com/Microsoft/TypeScript/issues/20469
const React = {
    createElement: h,
    Fragment: typeof DocumentFragment === 'function' ? DocumentFragment : () => { }
};

test__default['default']('render childless element', t => {
    const element = React.createElement("br", null);
    t.is(element.outerHTML, '<br>');
});
test__default['default']('render div with children', t => {
    const element = (React.createElement("div", null,
        React.createElement("span", null)));
    t.is(element.outerHTML, '<div><span></span></div>');
});
test__default['default']('render div with multiple children', t => {
    const element = (React.createElement("div", null,
        React.createElement("span", null),
        React.createElement("br", null)));
    t.is(element.outerHTML, '<div><span></span><br></div>');
});
test__default['default']('render array of children', t => {
    const element = (React.createElement("div", null,
        [
            React.createElement("span", { key: 0 }, "0"),
            React.createElement("span", { key: 1 }, "1")
        ],
        React.createElement("span", null, "2")));
    t.is(element.outerHTML, '<div><span>0</span><span>1</span><span>2</span></div>');
});
test__default['default']('render number child', t => {
    const element = React.createElement("span", null, "7");
    t.is(element.outerHTML, '<span>7</span>');
});
test__default['default']('render multiple number children', t => {
    const element = (React.createElement("span", null,
        1,
        2,
        3));
    t.is(element.outerHTML, '<span>123</span>');
});
test__default['default']('render string child', t => {
    const element = React.createElement("span", null, "test");
    t.is(element.outerHTML, '<span>test</span>');
});
test__default['default']('render multiple string children', t => {
    const element = (React.createElement("span", null,
        'hello',
        " ",
        'world'));
    t.is(element.outerHTML, '<span>hello world</span>');
});
test__default['default']('render div with TextNode child', t => {
    const element = React.createElement("div", null, document.createTextNode('Hello'));
    t.is(element.outerHTML, '<div>Hello</div>');
});
test__default['default']('skip boolean children', t => {
    const element = (React.createElement("span", null,
        true,
        false));
    t.is(element.outerHTML, '<span></span>');
});
test__default['default']('skip null children', t => {
    const element = React.createElement("span", null, null);
    t.is(element.outerHTML, '<span></span>');
});
test__default['default']('skip undefined children', t => {
    const element = React.createElement("span", null, undefined);
    t.is(element.outerHTML, '<span></span>');
});
test__default['default']('render falsey children', t => {
    const element = (React.createElement("span", null,
        0,
        Number.NaN));
    t.is(element.outerHTML, '<span>0NaN</span>');
});
test__default['default']('render other elements inside', t => {
    const firstElement = React.createElement("a", { href: "#first" }, "First");
    const secondElement = React.createElement("a", { href: "#second" }, "Second");
    const element = (React.createElement("div", null,
        firstElement,
        secondElement));
    t.is(element.outerHTML, '<div><a href="#first">First</a><a href="#second">Second</a></div>');
});
test__default['default']('render document fragments inside', t => {
    const template = document.createElement('template');
    template.innerHTML = 'Hello, <strong>World!</strong> ';
    const fragment = template.content;
    const element = React.createElement("div", null, fragment);
    t.is(element.outerHTML, '<div>Hello, <strong>World!</strong> </div>');
});
test__default['default'].serial('render svg', t => {
    const createElementNSSpy = sinon.spy(document, 'createElementNS');
    const element = (React.createElement("svg", null,
        React.createElement("text", { x: "20", y: "20" }, "Test")));
    t.truthy(element);
    t.true(createElementNSSpy.calledTwice);
    const xmlns = 'http://www.w3.org/2000/svg';
    t.deepEqual(createElementNSSpy.firstCall.args, [xmlns, 'text']);
    t.deepEqual(createElementNSSpy.secondCall.args, [xmlns, 'svg']);
    createElementNSSpy.restore();
});
test__default['default'].serial('render mixed html and svg', t => {
    const createElementSpy = sinon.spy(document, 'createElement');
    const createElementNSSpy = sinon.spy(document, 'createElementNS');
    const element = (React.createElement("div", null,
        React.createElement("h1", null, "Demo"),
        React.createElement("svg", null,
            React.createElement("text", null, "Test"))));
    t.truthy(element);
    t.true(createElementSpy.calledTwice);
    t.true(createElementNSSpy.calledTwice);
    t.deepEqual(createElementSpy.firstCall.args, ['h1']);
    t.deepEqual(createElementSpy.secondCall.args, ['div']);
    const xmlns = 'http://www.w3.org/2000/svg';
    t.deepEqual(createElementNSSpy.firstCall.args, [xmlns, 'text']);
    t.deepEqual(createElementNSSpy.secondCall.args, [xmlns, 'svg']);
    createElementSpy.restore();
    createElementNSSpy.restore();
});
test__default['default'].serial('create svg links with xlink namespace', t => {
    const setAttributeNS = sinon.spy(Element.prototype, 'setAttributeNS');
    const element = (React.createElement("svg", null,
        React.createElement("text", { id: "text" }, "Test"),
        React.createElement("use", { xlinkHref: "#text" }),
        React.createElement("use", { "xlink-invalid-attribute": "#text" })));
    t.truthy(element);
    t.true(setAttributeNS.calledOnce);
    const xmlns = 'http://www.w3.org/1999/xlink';
    t.deepEqual(setAttributeNS.firstCall.args, [
        xmlns,
        'xlink:href',
        '#text'
    ]);
    setAttributeNS.restore();
});
test__default['default']('assign className', t => {
    const element = React.createElement("span", { className: "a b c" });
    t.is(element.outerHTML, '<span class="a b c"></span>');
});
test__default['default']('assign className via class alias', t => {
    // @ts-expect-error
    const element = React.createElement("span", { class: "a b c" });
    t.is(element.outerHTML, '<span class="a b c"></span>');
});
test__default['default']('assign styles', t => {
    const style = {
        paddingTop: 10,
        width: 200,
        height: '200px',
        fontSize: 12
    };
    const element = React.createElement("span", Object.assign({}, { style }));
    t.is(element.outerHTML, '<span style="padding-top: 10px; width: 200px; height: 200px; font-size: 12px;"></span>');
});
test__default['default']('assign styles with dashed property names', t => {
    const style = {
        'padding-top': 10,
        'font-size': 12
    };
    // @ts-expect-error
    const element = React.createElement("span", { style: style });
    t.is(element.outerHTML, '<span style="padding-top: 10px; font-size: 12px;"></span>');
});
test__default['default']('assign styles with css variables', t => {
    const style = {
        '--padding-top': 10,
        '--myCamelCaseVar': 'red'
    };
    // @ts-expect-error
    const element = React.createElement("span", { style: style });
    t.is(element.outerHTML, '<span style="--padding-top: 10; --myCamelCaseVar: red;"></span>');
});
test__default['default']('assign other props', t => {
    const element = (React.createElement("a", { href: "video.mp4", id: "a", referrerPolicy: "no-referrer" }, "Download"));
    t.is(element.outerHTML, '<a href="video.mp4" id="a" referrerpolicy="no-referrer">Download</a>');
});
test__default['default']('assign htmlFor prop', t => {
    const element = React.createElement("label", { htmlFor: "name-input" }, "Full name");
    t.is(element.outerHTML, '<label for="name-input">Full name</label>');
});
test__default['default']('assign or skip boolean props', t => {
    const input = (React.createElement("input", { disabled: false }));
    t.is(input.outerHTML, '<input>');
    const link = (React.createElement("a", { download: true, contentEditable: true }, "Download"));
    t.is(link.outerHTML, '<a download="" contenteditable="">Download</a>');
});
test__default['default'].failing('assign booleanish false props', t => {
    const element = (React.createElement("span", { contentEditable: true },
        React.createElement("a", { contentEditable: false }, "Download")));
    const input = React.createElement("textarea", { spellCheck: false });
    t.is(element.outerHTML, '<span contenteditable="">a contenteditable="false">Download</a></span>');
    t.is(input.outerHTML, '<textarea spellcheck="false"></textarea>');
});
test__default['default']('skip undefined and null props', t => {
    const element = (
    // @ts-expect-error
    React.createElement("a", { href: undefined, title: null }, "Download"));
    t.is(element.outerHTML, '<a>Download</a>');
});
test__default['default']('escape props', t => {
    const element = React.createElement("a", { id: '"test"' }, "Download");
    t.is(element.outerHTML, '<a id="&quot;test&quot;">Download</a>');
});
test__default['default']('escape children', t => {
    const element = React.createElement("div", null, '<script>alert();</script>');
    t.is(element.outerHTML, '<div>&lt;script&gt;alert();&lt;/script&gt;</div>');
});
test__default['default']('set html', t => {
    const element = (React.createElement("div", { dangerouslySetInnerHTML: { __html: '<script>alert();</script>' } }));
    t.is(element.outerHTML, '<div><script>alert();</script></div>');
});
test__default['default']('attach event listeners', t => {
    const addEventListener = sinon.spy(EventTarget.prototype, 'addEventListener');
    const handleClick = function () { };
    const element = (React.createElement("a", { href: "#", onClick: handleClick }, "Download"));
    t.is(element.outerHTML, '<a href="#">Download</a>');
    t.true(addEventListener.calledOnce);
    t.deepEqual(addEventListener.firstCall.args, [
        'click',
        handleClick
    ]);
    addEventListener.restore();
});
test__default['default']('attach event listeners but drop the dash after on', t => {
    const addEventListener = sinon.spy(EventTarget.prototype, 'addEventListener');
    const handler = function () { };
    const element = (React.createElement("a", { href: "#", "onremote-input": handler, "on-remote-input": handler }, "Download"));
    t.is(element.outerHTML, '<a href="#">Download</a>');
    t.true(addEventListener.calledTwice);
    t.deepEqual(addEventListener.firstCall.args, [
        'remote-input',
        handler
    ]);
    t.deepEqual(addEventListener.secondCall.args, [
        'remote-input',
        handler
    ]);
    addEventListener.restore();
});
test__default['default']('fragment', t => {
    const createDocumentFragment = sinon.spy(document, 'createDocumentFragment');
    const fragment = React.createElement(React.Fragment, null, "test");
    const fragmentHTML = getFragmentHTML(fragment);
    t.is(fragmentHTML, 'test');
    t.true(createDocumentFragment.calledOnce);
    t.deepEqual(createDocumentFragment.firstCall.args, []);
});
test__default['default']('fragment 2', t => {
    const fragment = (React.createElement(React.Fragment, null,
        React.createElement("h1", null, "test")));
    const fragmentHTML = getFragmentHTML(fragment);
    t.is(fragmentHTML, '<h1>test</h1>');
});
test__default['default']('fragment 3', t => {
    const fragment = (React.createElement(React.Fragment, null,
        React.createElement("h1", null, "heading"),
        " text"));
    const fragmentHTML = getFragmentHTML(fragment);
    t.is(fragmentHTML, '<h1>heading</h1> text');
});
test__default['default']('div with inner fragment', t => {
    const element = (React.createElement("div", null,
        React.createElement(React.Fragment, null,
            React.createElement("h1", null, "heading"),
            " text"),
        React.createElement("span", null, "outside fragment")));
    t.is(element.outerHTML, '<div><h1>heading</h1> text<span>outside fragment</span></div>');
});
test__default['default']('element created by function', t => {
    const Icon = () => React.createElement("i", null);
    const element = React.createElement(Icon, null);
    t.is(element.outerHTML, '<i></i>');
});
test__default['default']('element created by function with existing children and attributes', t => {
    const Icon = () => React.createElement("i", { className: "sweet" },
        "Gummy ",
        React.createElement("span", null, "bears"));
    const element = React.createElement(Icon, null);
    t.is(element.outerHTML, '<i class="sweet">Gummy <span>bears</span></i>');
});
test__default['default']('element created by function with combined children and attributes', t => {
    const Icon = () => React.createElement("i", { className: "sweet" },
        "Gummy ",
        React.createElement("span", null, "bears"));
    // @ts-expect-error
    const element = React.createElement(Icon, { className: "yellow" },
        " and ",
        React.createElement("b", null, "lollipops"));
    t.is(element.outerHTML, '<i class="sweet yellow">Gummy <span>bears</span> and <b>lollipops</b></i>');
});
function getFragmentHTML(fragment) {
    return [...fragment.childNodes]
        // @ts-expect-error
        .map(n => n.outerHTML || n.textContent)
        .join('');
}
