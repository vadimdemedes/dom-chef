'use strict';

const svgTagNames = require('svg-tag-names');
const classnames = require('classnames');
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
	return Object
		.keys(style)
		.forEach(name => {
			let value = style[name];

			if (typeof value === 'number' && !IS_NON_DIMENSIONAL.test(name)) {
				value += 'px';
			}

			el.style.setProperty(name, value);
		});
};

const createElement = tagName => {
	if (isSVG(tagName)) {
		return document.createElementNS('http://www.w3.org/2000/svg', tagName);
	}

	return document.createElement(tagName);
};

const setAttribute = (el, name, value) => {
	// Naive support for xlink namespace
	// Full list: https://github.com/facebook/react/blob/1843f87/src/renderers/dom/shared/SVGDOMPropertyConfig.js#L258-L264
	if (/^xlink[AHRST]/.test(name)) {
		el.setAttributeNS('http://www.w3.org/1999/xlink', name, value);
	} else {
		el.setAttribute(name, value);
	}
};

const build = (tagName, attrs, children) => {
	const el = createElement(tagName);

	Object.keys(attrs).forEach(attrName => {
		const attrVal = attrs[attrName];
		if (attrName === 'class' || attrName === 'className') {
			setAttribute(el, 'class', classnames(attrVal));
		} else if (attrName === 'style') {
			setCSSProps(el, attrVal);
		} else if (attrName.indexOf('on') === 0) {
			const eventName = attrName.substr(2).toLowerCase();
			el.addEventListener(eventName, attrVal);
		} else if (attrName === 'dangerouslySetInnerHTML') {
			el.innerHTML = attrVal.__html;
		} else if (attrName !== 'key') {
			setAttribute(el, attrName, attrVal);
		}
	});

	if (!attrs.dangerouslySetInnerHTML) {
		children.forEach(child => {
			el.appendChild(child);
		});
	}

	return el;
};

function h(tagName, attrs) {
	attrs = attrs || {};

	const childrenArgs = [].slice.call(arguments, 2);
	const children = flatten(childrenArgs).map(child => {
		if (child instanceof Element) {
			return child;
		}

		if (typeof child === 'boolean' || child === null) {
			child = '';
		}

		return document.createTextNode(child);
	});

	return build(tagName, attrs, children);
}

exports.h = h;
