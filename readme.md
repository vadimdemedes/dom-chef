<h1 align="center">
  <br>
  <img width="300" src="media/logo.png">
  <br>
  <br>
	<br>
</h1>

> Build DOM elements using JSX automatically

[![Build Status](https://travis-ci.org/vadimdemedes/dom-chef.svg?branch=master)](https://travis-ci.org/vadimdemedes/dom-chef)


## Install

```
$ npm install --save dom-chef
```


## Features

- No API, JSX gets auto transformed into actual DOM elements
- Protection from XSS injections
- [Partial SVG support](#render-svg)
- React-like props naming (including events)
- Mix any DOM elements inside


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
    }
  ]
];

// ...
```

```jsx
const {h} = require('dom-chef');

const handleClick = e => {
	// <a> was clicked
};

const el = (
	<div class="header">
		<a href="#" class="link" onClick={handleClick}>Download</a>
	</div>
);

document.body.appendChild(el);
```

### Alternative usage

You can avoid configuring your JSX compiler by just letting it default to `React` and exporting the `React` object:

```js
const React = require('dom-chef');
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

### Set styles

```jsx
const el = <div style={{padding: 10, background: '#000'}}/>;
```

### Attach event listeners

```jsx
const handleClick = e => {
	// <span> was clicked
};

const el = <span onClick={handleClick}>Text</span>;
```

### Mix other elements inside

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

const wannaCry = <div dangerouslySetInnerHTML={{__html: dangerousHTML}}/>;
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


## License

MIT © [Vadim Demedes](https://github.com/vadimdemedes)
