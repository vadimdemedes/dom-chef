declare module 'svg-tag-names' {
	const SvgTagNames: string[];
	export default SvgTagNames;
}

declare namespace JSX {
	interface Element extends SVGElement, HTMLElement, DocumentFragment {}
	interface IntrinsicAttributes extends IntrinsicElements.span {
		class?: string;
	}
}
