import svgTagNames from 'svg-tag-names';

const svgTags = new Set(svgTagNames);
svgTags.delete('a');
svgTags.delete('audio');
svgTags.delete('canvas');
svgTags.delete('iframe');
svgTags.delete('script');
svgTags.delete('video');

type Attributes<T, P> = T extends keyof JSX.IntrinsicElements ?
	JSX.IntrinsicElements[T] :
	React.PropsWithChildren<P>;

declare global {
	interface Element {
		type: any;
		props: any;
		key: React.Key | null;
	}

	interface HTMLElement extends Element {
		ownerSVGElement: SVGElement['ownerSVGElement'];
		viewportElement: SVGElement['viewportElement'];
		correspondingElement: SVGElement['correspondingElement'];
		correspondingUseElement: SVGElement['correspondingUseElement'];
		getElementById: DocumentFragment['getElementById'];
	}

	interface SVGElement extends Element {
		getElementById: DocumentFragment['getElementById'];
	}

	interface DocumentFragment extends Element {
		ownerSVGElement: SVGElement['ownerSVGElement'];
		viewportElement: SVGElement['viewportElement'];
		correspondingElement: SVGElement['correspondingElement'];
		correspondingUseElement: SVGElement['correspondingUseElement'];
		addEventListener: HTMLElement['addEventListener'];
		removeEventListener: HTMLElement['removeEventListener'];
		className: HTMLElement['className'];
	}

	namespace JSX {
		interface Element extends HTMLElement, SVGElement, DocumentFragment {}
	}

	namespace React {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-qualifier
		interface ReactElement<P = any, T extends string | React.JSXElementConstructor<any> = string | React.JSXElementConstructor<any>> extends HTMLElement, SVGElement, DocumentFragment {}
	}
}

interface JSXElementClassDocumentFragment extends DocumentFragment, JSX.Element {}
interface Fragment {
	prototype: JSXElementClassDocumentFragment;
	new (): JSXElementClassDocumentFragment;
}

// Copied from Preact
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

const isFunctionComponent = (type: any): type is React.FC => {
	return typeof type === 'function' && type !== DocumentFragment;
};

const createElement = (type: string): HTMLElement | SVGElement => {
	return svgTags.has(type) ?
		document.createElementNS('http://www.w3.org/2000/svg', type) :
		document.createElement(type);
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

const setAttributes = <T, P>(
	element: Element | DocumentFragment,
	attributes?: Attributes<T, P>
) => {
	if (!attributes || element instanceof DocumentFragment) {
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
	children: React.ReactNodeArray
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
			parent.appendChild(document.createTextNode(child as string));
		}
	}
};

export const h = <T extends (string | React.FC<P> | typeof DocumentFragment), P>(
	type: T,
	attributes?: Attributes<T, P>,
	...children: React.ReactNodeArray
): Element | DocumentFragment | null => {
	// The `children` parameter takes precedence over `attributes.children`
	if (children.length === 0) {
		children = attributes?.children as React.ReactNodeArray ?? [];
	}

	if (isFunctionComponent(type)) {
		return type({...type.defaultProps, ...attributes, children});
	}

	const node = typeof type === 'string' ?
		createElement(type) :
		document.createDocumentFragment();

	addChildren(node, children);
	setAttributes(node, attributes);

	return node;
};

export const Fragment = (typeof DocumentFragment === 'function' ? DocumentFragment : () => {}) as Fragment;

// Improve TypeScript support for DocumentFragment
// https://github.com/Microsoft/TypeScript/issues/20469
const React = {
	createElement: h,
	Fragment
};

export default React;
