import svgTagNames from 'svg-tag-names';

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

// Copied from Preact
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

const isFragment = (
	type: DocumentFragmentConstructor | ElementFunction
): type is DocumentFragmentConstructor => {
	return type === DocumentFragment;
};

const setCSSProps = (
	element: HTMLElement | SVGElement,
	style: CSSStyleDeclaration
): void => {
	for (let [name, value] of Object.entries(style)) {
		if (typeof value === 'number' && !IS_NON_DIMENSIONAL.test(name)) {
			value = `${value as string}px`;
		}

		element.style[name as any] = value;
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
			const eventName = name.slice(2).toLowerCase();
			element.addEventListener(eventName, value);
		} else if (name === 'dangerouslySetInnerHTML' && '__html' in value) {
			element.innerHTML = value.__html;
		} else if (name !== 'key' && value !== false) {
			setAttribute(element, name, value === true ? '' : value);
		}
	}

	return element;
};

// Improve TypeScript support for DocumentFragment
// https://github.com/Microsoft/TypeScript/issues/20469
export default {
	createElement: h,
	Fragment: typeof DocumentFragment === 'function' ? DocumentFragment : () => {}
};
