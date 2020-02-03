import svgTagNames from 'svg-tag-names';
import flatten from 'arr-flatten';

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

const setCSSProps = (el: HTMLElement | SVGElement, style: CSSStyleDeclaration): void => {
	(Object.keys(style) as Array<keyof CSSStyleDeclaration>)
		.forEach(name => {
			let value = style[name];

			if (typeof value === 'number' && !IS_NON_DIMENSIONAL.test(name as string)) {
				value = `${value}px`;
			}

			el.style.setProperty(name as string, value);
		});
};

const createElement = (tagName: string): HTMLElement | SVGElement => {
	if (isSVG(tagName)) {
		return document.createElementNS('http://www.w3.org/2000/svg', tagName);
	}

	return document.createElement(tagName);
};

const setAttribute = (el: HTMLElement | SVGElement, name: string, value: string): void => {
	if (value === undefined || value === null) {
		return;
	}

	// Naive support for xlink namespace
	// Full list: https://github.com/facebook/react/blob/1843f87/src/renderers/dom/shared/SVGDOMPropertyConfig.js#L258-L264
	if (/^xlink[AHRST]/.test(name)) {
		el.setAttributeNS('http://www.w3.org/1999/xlink', name.replace('xlink', 'xlink:').toLowerCase(), value);
	} else {
		el.setAttribute(name, value);
	}
};

const build = <TProps extends Record<string, unknown>>(
	tagName: string,
	attrs: Attributes & TProps,
	children: DocumentFragment
): HTMLElement | SVGElement => {
	const el = createElement(tagName);

	Object.keys(attrs).forEach(name => {
		const value = attrs[name];
		if (name === 'class' || name === 'className') {
			setAttribute(el, 'class', value as string);
		} else if (name === 'style') {
			setCSSProps(el, value as CSSStyleDeclaration);
		} else if (name.indexOf('on') === 0) {
			const eventName = name.slice(2).toLowerCase();
			el.addEventListener(eventName, value as EventListenerOrEventListenerObject);
		} else if (isDangerouslySetInnerHTML(name, value)) {
			el.innerHTML = value.__html;
		} else if (name !== 'key' && value !== false) {
			setAttribute(el, name, value === true ? '' : value as string);
		}
	});

	if (!attrs.dangerouslySetInnerHTML) {
		el.appendChild(children);
	}

	return el;
};

export const h = <TProps extends Record<string, unknown>>(
	type: DocumentFragmentConstructor | string,
	props?: Attributes & TProps | null,
	...children: Node[]
): Element | DocumentFragment => {
	const childrenFragment = document.createDocumentFragment();

	flatten(children).forEach(child => {
		if (child instanceof Node) {
			childrenFragment.appendChild(child);
		} else if (typeof child !== 'boolean' && typeof child !== 'undefined' && child !== null) {
			childrenFragment.appendChild(document.createTextNode(child));
		}
	});

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
