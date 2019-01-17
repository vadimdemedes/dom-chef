// Improve TypeScript support for DocumentFragment
// https://github.com/Microsoft/TypeScript/issues/20469
exports.React = {
	createElement: require('.').h,
	Fragment: DocumentFragment
};
