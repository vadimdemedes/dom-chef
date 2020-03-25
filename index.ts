import svgTagNames from 'svg-tag-names';
import {flatten} from 'array-flatten';

type InnerHTMLSetter = {__html: string};
type AttributeValue =
	| string
	| number
	| boolean
	| undefined
	| null
	| CSSStyleDeclaration
	| InnerHTMLSetter
	| EventListenerOrEventListenerObject;
type Attributes = Record<string, AttributeValue>;
type DocumentFragmentConstructor = typeof DocumentFragment;

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

const svgTags = svgTagNames.filter(name => !excludeSvgTags.includes(name));

const isSVG = (tagName: string): boolean => svgTags.includes(tagName);

const isDangerouslySetInnerHTML = (name: string, value: AttributeValue): value is InnerHTMLSetter => {
	return Boolean(value) && typeof value === 'object' && name === 'dangerouslySetInnerHTML';
};

const setCSSProps = (element: HTMLElement | SVGElement, style: CSSStyleDeclaration): void => {
	for (let [name, value] of Object.entries(style)) {
		if (typeof value === 'number' && !IS_NON_DIMENSIONAL.test(name)) {
			value = `${value as string}px`;
		}

		element.style[name as any] = value;
	}
};

const createElement = (tagName: string): HTMLElement | SVGElement => {
	if (isSVG(tagName)) {
		return document.createElementNS('http://www.w3.org/2000/svg', tagName);
	}

	return document.createElement(tagName);
};

const setAttribute = (element: HTMLElement | SVGElement, name: string, value: string): void => {
	if (value === undefined || value === null) {
		return;
	}

	// Naive support for xlink namespace
	// Full list: https://github.com/facebook/react/blob/1843f87/src/renderers/dom/shared/SVGDOMPropertyConfig.js#L258-L264
	if (/^xlink[AHRST]/.test(name)) {
		element.setAttributeNS('http://www.w3.org/1999/xlink', name.replace('xlink', 'xlink:').toLowerCase(), value);
	} else {
		element.setAttribute(name, value);
	}
};

const build = (
	tagName: string,
	attrs: Attributes,
	children: DocumentFragment
): HTMLElement | SVGElement => {
	const element = createElement(tagName);

	for (const [name, value] of Object.entries(attrs)) {
		if (name === 'class' || name === 'className') {
			setAttribute(element, 'class', value as string);
		} else if (name === 'style') {
			setCSSProps(element, value as CSSStyleDeclaration);
		} else if (name.startsWith('on')) {
			const eventName = name.slice(2).toLowerCase();
			element.addEventListener(eventName, value as EventListenerOrEventListenerObject);
		} else if (isDangerouslySetInnerHTML(name, value)) {
			element.innerHTML = value.__html;
		} else if (name !== 'key' && value !== false) {
			setAttribute(element, name, value === true ? '' : value as string);
		}
	}

	if (!attrs.dangerouslySetInnerHTML) {
		element.appendChild(children);
	}

	return element;
};

export const h = (
	type: DocumentFragmentConstructor | string,
	props?: Attributes,
	...children: Node[]
): Element | DocumentFragment => {
	const childrenFragment = document.createDocumentFragment();

	for (const child of flatten(children)) {
		if (child instanceof Node) {
			childrenFragment.appendChild(child);
		} else if (typeof child !== 'boolean' && typeof child !== 'undefined' && child !== null) {
			childrenFragment.appendChild(document.createTextNode(child));
		}
	}

	if (typeof type !== 'string') {
		return childrenFragment;
	}

	return build(type, props ?? {}, childrenFragment);
};

// Improve TypeScript support for DocumentFragment
// https://github.com/Microsoft/TypeScript/issues/20469
export default {
	createElement: h,
	Fragment: typeof DocumentFragment === 'function' ? DocumentFragment : () => {}
};
