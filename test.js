import browserEnv from 'browser-env';
import {spy} from 'sinon';
import test from 'ava';
import {h} from '.';

browserEnv();

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

test('render same element in two different places', t => {
	const link = <a href="#">Link</a>;
	const firstEl = <div>{link}</div>;
	const secondEl = <span>{link}</span>;

	t.is(firstEl.outerHTML, '<div><a href="#">Link</a></div>');
	t.is(secondEl.outerHTML, '<span><a href="#">Link</a></span>');
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
	document.createElementNS.reset();

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

test('assign className', t => {
	const el = <span className="a b c"/>;

	t.is(el.outerHTML, '<span class="a b c"></span>');
});

test('assign className via class alias', t => {
	const el = <span class="a b c"/>;

	t.is(el.outerHTML, '<span class="a b c"></span>');
});

test('assign multiple classes', t => {
	const classes = {
		a: true,
		b: true,
		c: false
	};

	const el = <span className={classes}/>;

	t.is(el.outerHTML, '<span class="a b"></span>');
});

test('assign styles', t => {
	const style = {
		paddingTop: 10,
		width: 200,
		height: '200px'
	};

	const el = <span style={style}/>;

	t.is(el.outerHTML, '<span style="padding-top: 10px; width: 200px; height: 200px;"></span>');
});

test('assign other props', t => {
	const el = <a href="video.mp4" id="a" download referrerpolicy="no-referrer">Download</a>;

	t.is(el.outerHTML, '<a href="video.mp4" id="a" download="true" referrerpolicy="no-referrer">Download</a>');
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
	const handleClick = spy();
	const el = <a href="#" onClick={handleClick}>Download</a>;
	el.onclick();

	t.is(el.outerHTML, '<a href="#">Download</a>');
	t.true(handleClick.calledOnce);
});

test('trigger events for nested elements', t => {
	const handleClick = spy();
	const el = (
		<div>
			<a href="#" onClick={handleClick}>Download</a>
		</div>
	);

	el.firstChild.onclick();

	t.true(handleClick.calledOnce);
});
