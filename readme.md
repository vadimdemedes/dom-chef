<h1 align="center">
  <br>
  <img width="300" src="media/logo.png">
  <br>
  <br>
	<br>
</h1>

> Build regular DOM elements using JSX

With `dom-chef`, you can use Babel or TypeScript to transform [JSX](https://reactjs.org/docs/introducing-jsx.html) into plain old DOM elements, without using the unsafe `innerHTML` or clumsy `document.createElement` calls.

It supports everything you expect from JSX, including:

- [SVG elements](#render-svg)
- [Event listeners](#inline-event-listeners)
- [Inline CSS](#inline-styles)
- [Nested elements](#nested-elements)
- [Function elements](#use-functions)

If something isn't supported (or doesn't work as well as it does in React) please open an issue!

## Install

```
$ npm install dom-chef
```

## Usage

Make sure to use a JSX transpiler, set JSX [`pragma`](https://babeljs.io/docs/en/next/babel-plugin-transform-react-jsx.html#pragma)
to `h` and optionally the [`pragmaFrag`](https://babeljs.io/docs/en/next/babel-plugin-transform-react-jsx.html#pragmafrag)
to `DocumentFragment` [if you need fragment support](https://reactjs.org/blog/2017/11/28/react-v16.2.0-fragment-support.html).

```js
// babel.config.js

const plugins = [
	[
		'@babel/plugin-transform-react-jsx',
		{
			pragma: 'h',
			pragmaFrag: 'DocumentFragment',
		},
	],
];

// ...
```

```jsx
import {h} from 'dom-chef';

const handleClick = e => {
	// <a> was clicked
};

const el = (
	<div class="header">
		<a href="#" class="link" onClick={handleClick}>
			Download
		</a>
	</div>
);

document.body.appendChild(el);
```

### Alternative usage

You can avoid configuring your JSX compiler by just letting it default to `React` and exporting the `React` object:

```js
import React from 'dom-chef';
```

This has the advantage of enabling `Fragment` support with the TypeScript compiler, if you're using it compile JSX without Babel. Related issue: https://github.com/Microsoft/TypeScript/issues/20469

```
TS17016: JSX fragment is not supported when using --jsxFactory
```

## Recipes

### Set classes

```jsx
const el = <span class="a b c">Text</span>;

// or use `className` alias
const el = <span className="a b c">Text</span>;
```

### Inline styles

```jsx
const el = <div style={{padding: 10, background: '#000'}} />;
```

### Inline event listeners

```jsx
const handleClick = e => {
	// <span> was clicked
};

const el = <span onClick={handleClick}>Text</span>;
```

This is equivalent to: `span.addEventListener('click', handleClick)`

### Nested elements

```jsx
const title = <h1>Hello World</h1>;
const body = <p>Post body</p>;

const post = (
	<div class="post">
		{title}
		{body}
	</div>
);
```

### Set innerHTML

```jsx
const dangerousHTML = '<script>alert();</script>';

const wannaCry = <div dangerouslySetInnerHTML={{__html: dangerousHTML}} />;
```

### Render SVG

**Note**: Due to the way `dom-chef` works, tags `<a>`, `<audio>`, `<canvas>`, `<iframe>`, `<script>` and `<video>` aren't supported inside `<svg>` tag.

```jsx
const el = (
	<svg width={400} height={400}>
		<text x={100} y={100}>
			Wow
		</text>
	</svg>
);
```

### Use functions

If element names start with an uppercase letter, `dom-chef` will consider them as element-returning functions:

```jsx
function Title() {
	const title = document.createElement('h1');
	title.classList.add('Heading', 'red');
	title.append('La Divina Commedia');
	return title;
}

const el = <Title/>;
// <h1 class="Heading red">La Divina Commedia</h1>
```

```jsx
function Title(props) {
	const title = <h1 {...props}></h1>;
	title.classList.add('red');
	return title;
}

const el = <Title className="Heading">La Divina Commedia</Title>;
// <h1 class="Heading red">La Divina Commedia</h1>
```

[`defaultProps`](https://medium.com/@pojotorshemi/react-basis-default-props-and-typechecking-with-proptypes-4ddf02d15992) is also supported and will be included as props to the function as you'd expect:

```jsx
function AlertIcon(props) {
	return (
		<svg width={props.size} height={props.size} className={props.className}>
			{props.children}
		</svg>
	);
}

AlertIcon.defaultProps = {
	className: 'icon icon-alert',
	size: 16
}

const el = (
	<AlertIcon size={32}>
		<circle cx="16" cy="16" r="16" fill="#000"></circle>
	</AlertIcon>
);
// <svg width="32" height="32" class="icon icon-alert">
//     <circle cx="16" cy="16" r="16" fill="#000"></circle>
// </svg>
```

## License

MIT © [Vadim Demedes](https://github.com/vadimdemedes)
