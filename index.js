'use strict';

const svgTagNames = require('svg-tag-names');
const classnames = require('classnames');
const flatten = require('arr-flatten');
const omit = require('object.omit');

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

const getCSSProps = attrs => {
	return Object
		.keys(attrs.style || {})
		.map(name => {
			let value = attrs.style[name];

			if (typeof value === 'number' && !IS_NON_DIMENSIONAL.test(name)) {
				value += 'px';
			}

			return {name, value};
		});
};

const getHTMLProps = attrs => {
	const allProps = omit(attrs, ['class', 'className', 'style', 'key', 'dangerouslySetInnerHTML']);

	return Object
		.keys(allProps)
		.filter(name => name.indexOf('on') !== 0)
		.map(name => ({
			name,
			value: attrs[name]
		}));
};

const getEventListeners = attrs => {
	return Object
		.keys(attrs)
		.filter(name => name.indexOf('on') === 0)
		.map(name => ({
			name: name.toLowerCase().replace('on', ''),
			listener: attrs[name]
		}));
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

	const className = attrs.class || attrs.className;
	if (className) {
		el.className = classnames(className);
	}

	getCSSProps(attrs).forEach(prop => {
		el.style.setProperty(prop.name, prop.value);
	});

	getHTMLProps(attrs).forEach(prop => {
		setAttribute(el, prop.name, prop.value);
	});

	getEventListeners(attrs).forEach(event => {
		el.addEventListener(event.name, event.listener);
	});

	const setHTML = attrs.dangerouslySetInnerHTML;
	if (setHTML && setHTML.__html) {
		el.innerHTML = setHTML.__html;
	} else {
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
