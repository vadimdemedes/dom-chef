import test from 'ava';
import {spy} from 'sinon';

import './_fixtures';
import React, {Component} from '..';

test('render childless element', t => {
	const element = <br />;

	t.is(element.outerHTML, '<br>');
});

test('render div with children', t => {
	const element = (
		<div>
			<span />
		</div>
	);

	t.is(element.outerHTML, '<div><span></span></div>');
});

test('render div with multiple children', t => {
	const element = (
		<div>
			<span />
			<br />
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

	t.is(
		element.outerHTML,
		'<div><span>0</span><span>1</span><span>2</span></div>'
	);
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
			{'hello'} {'world'}
		</span>
	);

	t.is(element.outerHTML, '<span>hello world</span>');
});

test('render div with TextNode child', t => {
	const element = <div>{document.createTextNode('Hello')}</div>;

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
			{Number.NaN}
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

	t.is(
		element.outerHTML,
		'<div><a href="#first">First</a><a href="#second">Second</a></div>'
	);
});
test('render document fragments inside', t => {
	const template = document.createElement('template');
	template.innerHTML = 'Hello, <strong>World!</strong> ';
	const fragment = template.content;
	const element = <div>{fragment}</div>;

	t.is(element.outerHTML, '<div>Hello, <strong>World!</strong> </div>');
});

test.serial('render svg', t => {
	const createElementNSSpy = spy(document, 'createElementNS');

	const element = (
		<svg>
			<text x="20" y="20">
				Test
			</text>
		</svg>
	);

	t.truthy(element);
	t.true(createElementNSSpy.calledTwice);

	const xmlns = 'http://www.w3.org/2000/svg';
	t.deepEqual(createElementNSSpy.firstCall.args, [xmlns, 'text']);
	t.deepEqual(createElementNSSpy.secondCall.args, [xmlns, 'svg']);
	createElementNSSpy.restore();
});

test.serial('render mixed html and svg', t => {
	const createElementSpy = spy(document, 'createElement');
	const createElementNSSpy = spy(document, 'createElementNS');

	const element = (
		<div>
			<h1>Demo</h1>

			<svg>
				<text>Test</text>
			</svg>
		</div>
	);

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

test.serial('create svg links with xlink namespace', t => {
	const setAttributeNS = spy(Element.prototype, 'setAttributeNS');

	const element = (
		<svg>
			<text id="text">Test</text>
			<use xlinkHref="#text" />
			<use xlink-invalid-attribute="#text" />
		</svg>
	);

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

test('assign className', t => {
	const element = <span className="a b c" />;

	t.is(element.outerHTML, '<span class="a b c"></span>');
});

test('assign className via class alias', t => {
	// @ts-expect-error
	const element = <span class="a b c" />;

	t.is(element.outerHTML, '<span class="a b c"></span>');
});

test('assign styles', t => {
	const style = {
		paddingTop: 10,
		width: 200,
		height: '200px',
		fontSize: 12
	};

	const element = <span {...{style}} />;

	t.is(
		element.outerHTML,
		'<span style="padding-top: 10px; width: 200px; height: 200px; font-size: 12px;"></span>'
	);
});

test('assign styles with dashed property names', t => {
	const style = {
		'padding-top': 10,
		'font-size': 12
	};

	// @ts-expect-error
	const element = <span style={style} />;

	t.is(
		element.outerHTML,
		'<span style="padding-top: 10px; font-size: 12px;"></span>'
	);
});

test('assign styles with css variables', t => {
	const style = {
		'--padding-top': 10,
		'--myCamelCaseVar': 'red'
	};

	// @ts-expect-error
	const element = <span style={style} />;

	t.is(
		element.outerHTML,
		'<span style="--padding-top: 10; --myCamelCaseVar: red;"></span>'
	);
});

test('assign other props', t => {
	const element = (
		<a href="video.mp4" id="a" referrerPolicy="no-referrer">
			Download
		</a>
	);

	t.is(
		element.outerHTML,
		'<a href="video.mp4" id="a" referrerpolicy="no-referrer">Download</a>'
	);
});

test('assign htmlFor prop', t => {
	const element = <label htmlFor="name-input">Full name</label>;

	t.is(element.outerHTML, '<label for="name-input">Full name</label>');
});

test('assign or skip boolean props', t => {
	const input = (
		<input disabled={false} />
	);

	t.is(input.outerHTML, '<input>');

	const link = (
		<a download contentEditable={true}>
			Download
		</a>
	);

	t.is(link.outerHTML, '<a download="" contenteditable="">Download</a>');
});

test.failing('assign booleanish false props', t => {
	const element = (
		<span contentEditable>
			<a contentEditable={false}>Download</a>
		</span>
	);
	const input = <textarea spellCheck={false} />;

	t.is(
		element.outerHTML,
		'<span contenteditable=""><a contenteditable="false">Download</a></span>'
	);
	t.is(input.outerHTML, '<textarea spellcheck="false"></textarea>');
});

test('skip undefined and null props', t => {
	const element = (
		// @ts-expect-error
		<a href={undefined} title={null}>
			Download
		</a>
	);

	t.is(element.outerHTML, '<a>Download</a>');
});

test('escape props', t => {
	const element = <a id={'"test"'}>Download</a>;

	t.is(element.outerHTML, '<a id="&quot;test&quot;">Download</a>');
});

test('escape children', t => {
	const element = <div>{'<script>alert();</script>'}</div>;

	t.is(element.outerHTML, '<div>&lt;script&gt;alert();&lt;/script&gt;</div>');
});

test('set html', t => {
	const element = (
		<div dangerouslySetInnerHTML={{__html: '<script>alert();</script>'}} />
	);

	t.is(element.outerHTML, '<div><script>alert();</script></div>');
});

test('attach event listeners', t => {
	const addEventListener = spy(EventTarget.prototype, 'addEventListener');

	const handleClick = function () {};
	const element = (
		<a href="#" onClick={handleClick}>
			Download
		</a>
	);

	t.is(element.outerHTML, '<a href="#">Download</a>');

	t.true(addEventListener.calledOnce);
	t.deepEqual(addEventListener.firstCall.args, [
		'click',
		handleClick
	]);

	addEventListener.restore();
});

test('attach event listeners but drop the dash after on', t => {
	const addEventListener = spy(EventTarget.prototype, 'addEventListener');

	const handler = function () {};
	const element = (
		<a href="#" onremote-input={handler} on-remote-input={handler}>
			Download
		</a>
	);

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

test('fragment', t => {
	const createDocumentFragment = spy(document, 'createDocumentFragment');

	const fragment = <>test</>;

	const fragmentHTML = getFragmentHTML(fragment);

	t.is(fragmentHTML, 'test');
	t.true(createDocumentFragment.calledOnce);
	t.deepEqual(createDocumentFragment.firstCall.args, []);
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

	t.is(
		element.outerHTML,
		'<div><h1>heading</h1> text<span>outside fragment</span></div>'
	);
});

test('element created by function', t => {
	const Icon = () => <i/>;

	const element = <Icon />;

	t.is(element.outerHTML, '<i></i>');
});

test('element created by function has props', t => {
	const Container = ({value}: {value: string}) => <div>{value}</div>;

	const element = <Container value="Hello world"/>;

	t.is(element.outerHTML, '<div>Hello world</div>');
});

test('element created by function has props combined with default props', t => {
	const Container = ({value, className = ''}: {value: string; className?: string}) => <div className={className}>{value}</div>;
	Container.defaultProps = {
		value: 'Goodbye world',
		className: 'class'
	};

	const element = <Container value="Hello world"/>;

	t.is(element.outerHTML, '<div class="class">Hello world</div>');
});

test('element created by function with existing children and attributes', t => {
	const Icon = () => <i className="sweet">Gummy <span>bears</span></i>;

	const element = <Icon />;

	t.is(element.outerHTML, '<i class="sweet">Gummy <span>bears</span></i>');
});

test('element created by function with combined children and attributes', t => {
	const Icon = ({children}: {children: Node[]}) => <i className="sweet">Gummy <span>bears</span>{children}</i>;

	// @ts-expect-error
	const element = <Icon className="yellow"> and <b>lollipops</b></Icon>;

	t.is(
		element.outerHTML,
		'<i class="sweet">Gummy <span>bears</span> and <b>lollipops</b></i>'
	);
});

test('handle children prop as children instead of attributes', t => {
	const Icon = (props: Record<string, any>) => <i title="icon" {...props}/>;

	const element = <Icon className="yellow">Submarine</Icon>;

	t.is(
		element.outerHTML,
		'<i title="icon" class="yellow">Submarine</i>'
	);
});

test('preset children take precedence over children prop', t => {
	const Open = (props: Record<string, any>) => <h1 {...props}></h1>;
	const Preset = (props: Record<string, any>) => <h1 {...props}>Preset</h1>;

	const openElement = <Open>Door</Open>;
	const presetElement = <Preset>Door</Preset>;

	t.is(openElement.outerHTML, '<h1>Door</h1>');
	t.is(presetElement.outerHTML, '<h1>Preset</h1>');
});

test('render function will be used if possible', t => {
	class Icon extends Component {
		render() {
			return <i {...this.props}></i>;
		}
	}

	const element = <Icon className="Never gonna give you up">Never gonna let you down</Icon>;

	t.is(
		element.outerHTML,
		'<i class="Never gonna give you up">Never gonna let you down</i>'
	);
});

function getFragmentHTML(fragment: DocumentFragment): string {
	return [...fragment.childNodes]
		// @ts-expect-error
		.map(n => n.outerHTML || n.textContent)
		.join('');
}
