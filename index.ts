import svgTagNames from 'svg-tag-names';

const svgTags = new Set(svgTagNames);
svgTags.delete('a');
svgTags.delete('audio');
svgTags.delete('canvas');
svgTags.delete('iframe');
svgTags.delete('script');
svgTags.delete('video');

type Attributes = JSX.IntrinsicElements['div'] & {
	children?: Node[];
};

type FunctionComponent = ((props?: any) => Element | DocumentFragment) & {
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

interface JSXElementClassDocumentFragment extends DocumentFragment, JSX.ElementClass {}
interface Fragment {
	prototype: JSXElementClassDocumentFragment;
	new (): JSXElementClassDocumentFragment;
}

// Copied from Preact
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

const isFunctionComponent = (type: any): type is FunctionComponent => {
	return typeof type === 'function' && type !== DocumentFragment;
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

const setAttribute = (
	element: Element,
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

const setAttributes = (
	element: Element,
	attributes?: Attributes
) => {
	if (!attributes) {
		return;
	}

	for (let [name, value] of Object.entries(attributes)) {
		if (name === 'htmlFor') {
			name = 'for';
		} else if (name === 'children') {
			continue;
		}

		if (name === 'class' || name === 'className') {
			const existingClassname = element.getAttribute('class') ?? '';
			setAttribute(
				element,
				'class',
				(existingClassname + ' ' + String(value)).trim()
			);
		} else if (name === 'style' && (element instanceof HTMLElement || element instanceof SVGElement)) {
			setCSSProps(element, value);
		} else if (name.startsWith('on')) {
			const eventName = name.slice(2).toLowerCase().replace(/^-/, '');
			element.addEventListener(eventName, value);
		} else if (name === 'dangerouslySetInnerHTML' && '__html' in value) {
			element.innerHTML = value.__html;
		} else if (name !== 'key' && value !== false) {
			setAttribute(element, name, value === true ? '' : value);
		}
	}
};

const addChildren = (
	parent: Node,
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
	type: typeof DocumentFragment | FunctionComponent | string,
	attributes?: Attributes,
	...children: Node[]
): Element | DocumentFragment => {
	// The `children` parameter takes precedence over `attributes.children`
	if (children.length === 0) {
		children = attributes?.children ?? [];
	}

	if (isFunctionComponent(type)) {
		return type({...type.defaultProps, ...attributes, children});
	}

	if (typeof type === 'string') {
		const element = svgTags.has(type) ?
			document.createElementNS('http://www.w3.org/2000/svg', type) :
			document.createElement(type);

		addChildren(element, children);
		setAttributes(element, attributes);

		return element;
	}

	const fragment = document.createDocumentFragment();
	addChildren(fragment, children);
	return fragment;
};

export const Fragment = (typeof DocumentFragment === 'function' ? DocumentFragment : () => {}) as Fragment;

// Improve TypeScript support for DocumentFragment
// https://github.com/Microsoft/TypeScript/issues/20469
const React = {
	createElement: h,
	Fragment
};

export default React;
