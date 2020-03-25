const {JSDOM} = require('jsdom');
const {spy} = require('sinon');
const test = require('ava');

// This order and `require` are necessary because the
// `DocumentFragment` global is used/exported right away
const {window} = new JSDOM('…');
global.document = window.document;
global.Node = window.Node;
global.Element = window.Element;
global.DocumentFragment = window.DocumentFragment;
global.EventTarget = window.EventTarget;

const React = require('.').default;

test('render childless element', t => {
	const element = <br/>;

	t.is(element.outerHTML, '<br>');
});

test('render div with children', t => {
	const element = (
		<div>
			<span/>
		</div>
	);

	t.is(element.outerHTML, '<div><span></span></div>');
});

test('render div with multiple children', t => {
	const element = (
		<div>
			<span/>
			<br/>
		</div>
	);

	t.is(element.outerHTML, '<div><span></span><br></div>');
});

test('render array of children', t => {
	const element = (
		<div>
			{[
				<span key={0}>0</span>,
				<span key={1}>1</span>
			]}

			<span>2</span>
		</div>
	);

	t.is(element.outerHTML, '<div><span>0</span><span>1</span><span>2</span></div>');
});

test('render number child', t => {
	const element = <span>7</span>;

	t.is(element.outerHTML, '<span>7</span>');
});

test('render multiple number children', t => {
	const element = (
		<span>
			{1}
			{2}
			{3}
		</span>
	);

	t.is(element.outerHTML, '<span>123</span>');
});

test('render string child', t => {
	const element = <span>test</span>;

	t.is(element.outerHTML, '<span>test</span>');
});

test('render multiple string children', t => {
	const element = (
		<span>
			{'hello'}
			{' '}
			{'world'}
		</span>
	);

	t.is(element.outerHTML, '<span>hello world</span>');
});

test('render div with TextNode child', t => {
	const element = (
		<div>
			{document.createTextNode('Hello')}
		</div>
	);

	t.is(element.outerHTML, '<div>Hello</div>');
});

test('skip boolean children', t => {
	const element = (
		<span>
			{true}
			{false}
		</span>
	);

	t.is(element.outerHTML, '<span></span>');
});

test('skip null children', t => {
	const element = <span>{null}</span>;

	t.is(element.outerHTML, '<span></span>');
});

test('skip undefined children', t => {
	const element = <span>{undefined}</span>;

	t.is(element.outerHTML, '<span></span>');
});

test('render falsey children', t => {
	const element = (
		<span>
			{0}
			{NaN}
		</span>
	);

	t.is(element.outerHTML, '<span>0NaN</span>');
});

test('render other elements inside', t => {
	const firstElement = <a href="#first">First</a>;
	const secondElement = <a href="#second">Second</a>;
	const element = (
		<div>
			{firstElement}
			{secondElement}
		</div>
	);

	t.is(element.outerHTML, '<div><a href="#first">First</a><a href="#second">Second</a></div>');
});
test('render document fragments inside', t => {
	const template = document.createElement('template');
	template.innerHTML = 'Hello, <strong>World!</strong> ';
	const fragment = template.content;
	const element = (
		<div>
			{fragment}
		</div>
	);

	t.is(element.outerHTML, '<div>Hello, <strong>World!</strong> </div>');
});

test.serial('render svg', t => {
	spy(document, 'createElementNS');

	const element = (
		<svg>
			<text x="20" y="20">
				Test
			</text>
		</svg>
	);

	t.truthy(element);
	t.true(document.createElementNS.calledTwice);

	const xmlns = 'http://www.w3.org/2000/svg';
	t.deepEqual(document.createElementNS.firstCall.args, [xmlns, 'text']);
	t.deepEqual(document.createElementNS.secondCall.args, [xmlns, 'svg']);
});

test.serial('render mixed html and svg', t => {
	spy(document, 'createElement');
	document.createElementNS.resetHistory();

	const element = (
		<div>
			<h1>Demo</h1>

			<svg>
				<text>Test</text>
			</svg>
		</div>
	);

	t.truthy(element);
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

	const element = (
		<svg>
			<text id="text">Test</text>
			<use xlinkHref="#text"/>
			<use xlink-invalid-attribute="#text"/>
		</svg>
	);

	t.truthy(element);
	t.true(Element.prototype.setAttributeNS.calledOnce);

	const xmlns = 'http://www.w3.org/1999/xlink';
	t.deepEqual(Element.prototype.setAttributeNS.firstCall.args, [xmlns, 'xlink:href', '#text']);
});

test('assign className', t => {
	const element = <span className="a b c"/>;

	t.is(element.outerHTML, '<span class="a b c"></span>');
});

test('assign className via class alias', t => {
	const element = <span class="a b c"/>;

	t.is(element.outerHTML, '<span class="a b c"></span>');
});

test('assign styles', t => {
	const style = {
		paddingTop: 10,
		width: 200,
		height: '200px',
		fontSize: 12
	};

	const element = <span {...{style}}/>;

	t.is(element.outerHTML, '<span style="padding-top: 10px; width: 200px; height: 200px; font-size: 12px;"></span>');
});

test('assign styles with dashed property names', t => {
	const style = {
		'padding-top': 10,
		'font-size': 12
	};

	const element = <span style={style}/>;

	t.is(element.outerHTML, '<span style="padding-top: 10px; font-size: 12px;"></span>');
});

test('assign other props', t => {
	const element = <a href="video.mp4" id="a" referrerpolicy="no-referrer">Download</a>;

	t.is(element.outerHTML, '<a href="video.mp4" id="a" referrerpolicy="no-referrer">Download</a>');
});

test('assign or skip boolean props', t => {
	const element = <a download disabled={false} contenteditable={true}>Download</a>;

	t.is(element.outerHTML, '<a download="" contenteditable="">Download</a>');
});

test.failing('assign booleanish false props', t => {
	const element = <span contentEditable><a contentEditable={false}>Download</a></span>;
	const input = <textarea spellCheck={false}/>;

	t.is(element.outerHTML, '<span contenteditable="">a contenteditable="false">Download</a></span>');
	t.is(input.outerHTML, '<textarea spellcheck="false"></textarea>');
});

test('skip undefined and null props', t => {
	const element = <a href={undefined} title={null}>Download</a>;

	t.is(element.outerHTML, '<a>Download</a>');
});

test('escape props', t => {
	const element = <a id={'"test"'}>Download</a>;

	t.is(element.outerHTML, '<a id="&quot;test&quot;">Download</a>');
});

test('escape children', t => {
	const element = (
		<div>
			{'<script>alert();</script>'}
		</div>
	);

	t.is(element.outerHTML, '<div>&lt;script&gt;alert();&lt;/script&gt;</div>');
});

test('set html', t => {
	const element = <div dangerouslySetInnerHTML={{__html: '<script>alert();</script>'}}/>;

	t.is(element.outerHTML, '<div><script>alert();</script></div>');
});

test('attach event listeners', t => {
	spy(EventTarget.prototype, 'addEventListener');

	const handleClick = function () {};
	const element = <a href="#" onClick={handleClick}>Download</a>;

	t.is(element.outerHTML, '<a href="#">Download</a>');

	t.true(EventTarget.prototype.addEventListener.calledOnce);
	t.deepEqual(EventTarget.prototype.addEventListener.firstCall.args, ['click', handleClick]);
});

test('fragment', t => {
	spy(document, 'createDocumentFragment');

	const fragment = <>test</>;

	const fragmentHTML = getFragmentHTML(fragment);

	t.is(fragmentHTML, 'test');
	t.true(document.createDocumentFragment.calledOnce);
	t.deepEqual(document.createDocumentFragment.firstCall.args, []);
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
	const element = (
		<div>
			<>
				<h1>heading</h1> text
			</>
			<span>outside fragment</span>
		</div>
	);

	t.is(element.outerHTML, '<div><h1>heading</h1> text<span>outside fragment</span></div>');
});

function getFragmentHTML(fragment /* : DocumentFragment */) /* : string */ {
	return [...fragment.childNodes]
		.map(n => n.outerHTML || n.textContent)
		.join('');
}
