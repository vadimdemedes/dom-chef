const {JSDOM} = require('jsdom');
const {spy} = require('sinon');
const test = require('ava');

// This order and `require` are necessary because the
// `DocumentFragment` global is used/exported right away
const {window} = new JSDOM('...');
global.document = window.document;
global.Node = window.Node;
global.Element = window.Element;
global.DocumentFragment = window.DocumentFragment;
global.EventTarget = window.EventTarget;

const {h} = require('.');

test('render childless element', t => {
	const el = <br/>;

	t.is(el.outerHTML, '<br>');
});

test('render div with children', t => {
	const el = (
		<div>
			<span/>
		</div>
	);

	t.is(el.outerHTML, '<div><span></span></div>');
});

test('render div with multiple children', t => {
	const el = (
		<div>
			<span/>
			<br/>
		</div>
	);

	t.is(el.outerHTML, '<div><span></span><br></div>');
});

test('render array of children', t => {
	const el = (
		<div>
			{[
				<span key={0}>0</span>,
				<span key={1}>1</span>
			]}

			<span>2</span>
		</div>
	);

	t.is(el.outerHTML, '<div><span>0</span><span>1</span><span>2</span></div>');
});

test('render number child', t => {
	const el = <span>7</span>;

	t.is(el.outerHTML, '<span>7</span>');
});

test('render multiple number children', t => {
	const el = (
		<span>
			{1}
			{2}
			{3}
		</span>
	);

	t.is(el.outerHTML, '<span>123</span>');
});

test('render string child', t => {
	const el = <span>test</span>;

	t.is(el.outerHTML, '<span>test</span>');
});

test('render multiple string children', t => {
	const el = (
		<span>
			{'hello'}
			{' '}
			{'world'}
		</span>
	);

	t.is(el.outerHTML, '<span>hello world</span>');
});

test('render div with TextNode child', t => {
	const el = (
		<div>
			{document.createTextNode('Hello')}
		</div>
	);

	t.is(el.outerHTML, '<div>Hello/div>');
});

test('skip boolean children', t => {
	const el = (
		<span>
			{true}
			{false}
		</span>
	);

	t.is(el.outerHTML, '<span></span>');
});

test('skip null children', t => {
	const el = <span>{null}</span>;

	t.is(el.outerHTML, '<span></span>');
});

test('render falsey children', t => {
	const el = (
		<span>
			{undefined}
			{0}
			{NaN}
		</span>
	);

	t.is(el.outerHTML, '<span>undefined0NaN</span>');
});

test('render other elements inside', t => {
	const firstEl = <a href="#first">First</a>;
	const secondEl = <a href="#second">Second</a>;
	const el = (
		<div>
			{firstEl}
			{secondEl}
		</div>
	);

	t.is(el.outerHTML, '<div><a href="#first">First</a><a href="#second">Second</a></div>');
});
test('render document fragments inside', t => {
	const template = document.createElement('template');
	template.innerHTML = 'Hello, <strong>World!</strong> ';
	const fragment = template.content;
	const el = (
		<div>
			{fragment}
		</div>
	);

	t.is(el.outerHTML, '<div>Hello, <strong>World!</strong> </div>');
});

test.serial('render svg', t => {
	spy(document, 'createElementNS');

	const el = (
		<svg>
			<text x="20" y="20">
				Test
			</text>
		</svg>
	);

	t.truthy(el);
	t.true(document.createElementNS.calledTwice);

	const xmlns = 'http://www.w3.org/2000/svg';
	t.deepEqual(document.createElementNS.firstCall.args, [xmlns, 'text']);
	t.deepEqual(document.createElementNS.secondCall.args, [xmlns, 'svg']);
});

test.serial('render mixed html and svg', t => {
	spy(document, 'createElement');
	document.createElementNS.resetHistory();

	const el = (
		<div>
			<h1>Demo</h1>

			<svg>
				<text>Test</text>
			</svg>
		</div>
	);

	t.truthy(el);
	t.true(document.createElement.calledTwice);
	t.true(document.createElementNS.calledTwice);

	t.deepEqual(document.createElement.firstCall.args, ['h1']);
	t.deepEqual(document.createElement.secondCall.args, ['div']);

	const xmlns = 'http://www.w3.org/2000/svg';
	t.deepEqual(document.createElementNS.firstCall.args, [xmlns, 'text']);
	t.deepEqual(document.createElementNS.secondCall.args, [xmlns, 'svg']);
});

test.serial('create svg links with xlink namespace', t => {
	spy(Element.prototype, 'setAttributeNS');

	const el = (
		<svg>
			<text id="text">Test</text>
			<use xlinkHref="#text"/>
			<use xlink-invalid-attribute="#text"/>
		</svg>
	);

	t.truthy(el);
	t.true(Element.prototype.setAttributeNS.calledOnce);

	const xmlns = 'http://www.w3.org/1999/xlink';
	t.deepEqual(Element.prototype.setAttributeNS.firstCall.args, [xmlns, 'xlink:href', '#text']);
});

test('assign className', t => {
	const el = <span className="a b c"/>;

	t.is(el.outerHTML, '<span class="a b c"></span>');
});

test('assign className via class alias', t => {
	const el = <span class="a b c"/>;

	t.is(el.outerHTML, '<span class="a b c"></span>');
});

test('assign styles', t => {
	const style = {
		paddingTop: 10,
		width: 200,
		height: '200px',
		fontSize: 12
	};

	const el = <span style={style}/>;

	t.is(el.outerHTML, '<span style="padding-top: 10px; width: 200px; height: 200px; font-size: 12px;"></span>');
});

test('assign styles with dashed property names', t => {
	const style = {
		'padding-top': 10,
		'font-size': 12
	};

	const el = <span style={style}/>;

	t.is(el.outerHTML, '<span style="padding-top: 10px; font-size: 12px;"></span>');
});

test('assign other props', t => {
	const el = <a download href="video.mp4" id="a" referrerpolicy="no-referrer">Download</a>;

	t.is(el.outerHTML, '<a download="true" href="video.mp4" id="a" referrerpolicy="no-referrer">Download</a>');
});

test('escape props', t => {
	const el = <a id={'"test"'}>Download</a>;

	t.is(el.outerHTML, '<a id="&quot;test&quot;">Download</a>');
});

test('escape children', t => {
	const el = (
		<div>
			{'<script>alert();</script>'}
		</div>
	);

	t.is(el.outerHTML, '<div>&lt;script&gt;alert();&lt;/script&gt;</div>');
});

test('set html', t => {
	const el = <div dangerouslySetInnerHTML={{__html: '<script>alert();</script>'}}/>;

	t.is(el.outerHTML, '<div><script>alert();</script></div>');
});

test('attach event listeners', t => {
	spy(EventTarget.prototype, 'addEventListener');

	const handleClick = function () {};
	const el = <a href="#" onClick={handleClick}>Download</a>; // eslint-disable-line react/jsx-no-bind

	t.is(el.outerHTML, '<a href="#">Download</a>');

	t.true(EventTarget.prototype.addEventListener.calledOnce);
	t.deepEqual(EventTarget.prototype.addEventListener.firstCall.args, ['click', handleClick]);
});

test('fragment', t => {
	spy(document, 'createDocumentFragment');

	const fragment = <>test</>;

	const fragmentHTML = getFragmentHTML(fragment);

	t.is(fragmentHTML, 'test');
	t.true(document.createDocumentFragment.calledTwice);
	t.deepEqual(document.createDocumentFragment.firstCall.args, []);
	t.deepEqual(document.createDocumentFragment.secondCall.args, []);
});

test('fragment 2', t => {
	const fragment = (
		<>
			<h1>test</h1>
		</>
	);

	const fragmentHTML = getFragmentHTML(fragment);

	t.is(fragmentHTML, '<h1>test</h1>');
});

test('fragment 3', t => {
	const fragment = (
		<>
			<h1>heading</h1> text
		</>
	);

	const fragmentHTML = getFragmentHTML(fragment);

	t.is(fragmentHTML, '<h1>heading</h1> text');
});

test('div with inner fragment', t => {
	const el = (
		<div>
			<>
				<h1>heading</h1> text
			</>
			<span>outside fragment</span>
		</div>
	);

	t.is(el.outerHTML, '<div><h1>heading</h1> text<span>outside fragment</span></div>');
});

function getFragmentHTML(fragment /* : DocumentFragment */) /* : string */ {
	return [...fragment.childNodes]
		.map(n => n.outerHTML || n.textContent)
		.join('');
}
