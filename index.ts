import {svgTagNames} from 'svg-tag-names';
import {IS_NON_DIMENSIONAL} from 'preact/src/constants';

const svgTags = new Set(svgTagNames);
svgTags.delete('a');
svgTags.delete('audio');
svgTags.delete('canvas');
svgTags.delete('iframe');
svgTags.delete('script');
svgTags.delete('video');

type Attributes = JSX.IntrinsicElements['div'];
type DocumentFragmentConstructor = typeof DocumentFragment;
type ElementFunction = ((props?: any) => HTMLElement | SVGElement) & {
	defaultProps?: any;
};

declare global {
	namespace JSX {
		interface Element extends HTMLElement, SVGElement, DocumentFragment {
			addEventListener: HTMLElement['addEventListener'];
			removeEventListener: HTMLElement['removeEventListener'];
			className: HTMLElement['className'];
		}
	}
}

interface JSXElementClassDocumentFragment extends DocumentFragment, JSX.ElementClass { }
interface Fragment {
	prototype: JSXElementClassDocumentFragment;
	new(): JSXElementClassDocumentFragment;
}

const isFragment = (
	type: DocumentFragmentConstructor | ElementFunction
): type is DocumentFragmentConstructor => {
	return type === DocumentFragment;
};

const setCSSProps = (
	element: HTMLElement | SVGElement,
	style: CSSStyleDeclaration
): void => {
	for (const [name, value] of Object.entries(style)) {
		if (name.startsWith('-')) {
			element.style.setProperty(name, value);
		} else if (typeof value === 'number' && !IS_NON_DIMENSIONAL.test(name)) {
			element.style[name as any] = `${value as string}px`;
		} else {
			element.style[name as any] = value;
		}
	}
};

const create = (
	type: DocumentFragmentConstructor | ElementFunction | string
): HTMLElement | SVGElement | DocumentFragment => {
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

const setAttribute = (
	element: HTMLElement | SVGElement,
	name: string,
	value: string
): void => {
	if (value === undefined || value === null) {
		return;
	}

	// Naive support for xlink namespace
	// Full list: https://github.com/facebook/react/blob/1843f87/src/renderers/dom/shared/SVGDOMPropertyConfig.js#L258-L264
	if (/^xlink[AHRST]/.test(name)) {
		element.setAttributeNS(
			'http://www.w3.org/1999/xlink',
			name.replace('xlink', 'xlink:').toLowerCase(),
			value
		);
	} else {
		element.setAttribute(name, value);
	}
};

const addChildren = (
	parent: Element | DocumentFragment,
	children: Node[]
): void => {
	for (const child of children) {
		if (child instanceof Node) {
			parent.appendChild(child);
		} else if (Array.isArray(child)) {
			addChildren(parent, child);
		} else if (
			typeof child !== 'boolean' &&
			typeof child !== 'undefined' &&
			child !== null
		) {
			parent.appendChild(document.createTextNode(child));
		}
	}
};

const reservedAttrs = new Set([
	// These attributes allow "false" as a valid value
	'contentEditable',
	'draggable',
	'spellCheck',
	'value',
	// SVG specific
	'autoReverse',
	'externalResourcesRequired',
	'focusable',
	'preserveAlpha'
]);

export const h = (
	type: DocumentFragmentConstructor | ElementFunction | string,
	attributes?: Attributes,
	...children: Node[]
): Element | DocumentFragment => {
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
			const existingClassname = element.getAttribute('class') ?? '';
			setAttribute(
				element,
				'class',
				(existingClassname + ' ' + String(value)).trim()
			);
		} else if (name === 'style') {
			setCSSProps(element, value);
		} else if (name.startsWith('on')) {
			const eventName = name.slice(2).toLowerCase().replace(/^-/, '');
			element.addEventListener(eventName, value);
		} else if (name === 'dangerouslySetInnerHTML' && '__html' in value) {
			element.innerHTML = value.__html;
		} else if (name !== 'key' && (reservedAttrs.has(name) || value !== false)) {
			setAttribute(element, name, value === true ? '' : value);
		}
	}

	return element;
};

export const Fragment = (typeof DocumentFragment === 'function' ? DocumentFragment : () => {}) as Fragment;

// Improve TypeScript support for DocumentFragment
// https://github.com/Microsoft/TypeScript/issues/20469
const React = {
	createElement: h,
	Fragment
};

export default React;
