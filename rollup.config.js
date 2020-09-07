import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
	input: 'index.ts',
	output: {
		format: 'esm',
		dir: '.'
	},
	external: [
		// These are `type: module` packages so they don't need to be bundled
		'webext-detect-page'
	],
	plugins: [
		resolve(),
		commonjs(),
		json(),
		typescript({
			outDir: '.'
		})
	]
};
