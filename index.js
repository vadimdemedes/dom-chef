'use strict';

const svgTagNames = require('svg-tag-names');
const flatten = require('arr-flatten');

// Copied from Preact
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

const excludeSvgTags = [
	'a',
	'audio',
	'canvas',
	'iframe',
	'script',
	'video'
];

const svgTags = svgTagNames.filter(name => excludeSvgTags.indexOf(name) === -1);

const isSVG = tagName => svgTags.indexOf(tagName) >= 0;

const setCSSProps = (el, style) => {
	Object
		.keys(style)
		.forEach(name => {
			let value = style[name];

			if (typeof value === 'number' && !IS_NON_DIMENSIONAL.test(name)) {
				value += 'px';
			}

			el.style[name] = value;
		});
};

const createElement = tagName => {
	if (isSVG(tagName)) {
		return document.createElementNS('http://www.w3.org/2000/svg', tagName);
	}

	if (tagName === DocumentFragment) {
		return document.createDocumentFragment();
	}

	return document.createElement(tagName);
};

const setAttribute = (el, name, value) => {
	// Naive support for xlink namespace
	// Full list: https://github.com/facebook/react/blob/1843f87/src/renderers/dom/shared/SVGDOMPropertyConfig.js#L258-L264
	if (/^xlink[AHRST]/.test(name)) {
		el.setAttributeNS('http://www.w3.org/1999/xlink', name.replace('xlink', 'xlink:').toLowerCase(), value);
	} else {
		el.setAttribute(name, value);
	}
};

const build = (tagName, attrs, children) => {
	const el = createElement(tagName);

	Object.keys(attrs).forEach(name => {
		const value = attrs[name];
		if (name === 'class' || name === 'className') {
			setAttribute(el, 'class', value);
		} else if (name === 'style') {
			setCSSProps(el, value);
		} else if (name.indexOf('on') === 0) {
			const eventName = name.substr(2).toLowerCase();
			el.addEventListener(eventName, value);
		} else if (name === 'dangerouslySetInnerHTML') {
			el.innerHTML = value.__html;
		} else if (name !== 'key') {
			setAttribute(el, name, value);
		}
	});

	if (!attrs.dangerouslySetInnerHTML) {
		el.appendChild(children);
	}

	return el;
};

function h(tagName, attrs) {
	// eslint-disable-next-line prefer-rest-params
	const childrenArgs = [].slice.apply(arguments, [2]);
	const children = document.createDocumentFragment();

	flatten(childrenArgs).forEach(child => {
		if (child instanceof Element || child instanceof DocumentFragment) {
			children.appendChild(child);
		} else if (typeof child !== 'boolean' && child !== null) {
			children.appendChild(document.createTextNode(child));
		}
	});

	return build(tagName, attrs || {}, children);
}

exports.h = h;

exports.React = {
  createElement: h,
  Fragment: DocumentFragment,
};

