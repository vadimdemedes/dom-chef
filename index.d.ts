// Adapted from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts

type Key = string | number;

interface Attributes {
	key?: Key;
}

declare namespace React {
	export function createElement<P extends {}>(
		type: DocumentFragment | string,
		props?: Attributes & P | null,
		...children: (Element | DocumentFragment)[]
	): Element | DocumentFragment;

	export type Fragment = DocumentFragment | Function
	export type h = typeof createElement
}
