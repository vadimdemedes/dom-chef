// Adapted from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts

interface Attributes {
	key?: string | number;
}

declare namespace React {
	export function createElement<P extends {}>(
		type: DocumentFragment | string,
		props?: Attributes & P | null,
		...children: (Node)[]
	): Element | DocumentFragment;

	export type Fragment = DocumentFragment | Function;
	export type h = typeof createElement;
}
