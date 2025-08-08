import typescript from "@rollup/plugin-typescript"
import nodeResolve from "@rollup/plugin-node-resolve"
import path from "node:path"
// @ts-check

const nodeModulesDir = path.join(process.cwd(), "node_modules");

/** @type {import("rollup").RollupOptions} */
export default {
    input: "./index.ts",
    output: {
        name: "DOMChef",
        file: "./umd.js",
        format: "umd",
        exports: "named",
    },
    plugins: [
        typescript({
            declaration: false,
        }),
        nodeResolve(),
        {
            name: "add-region-to-third-party-libraries",
            transform(code, id) {
                if (!id.startsWith(nodeModulesDir)) {
                    return code;
                }
                return "//#region node_modules" + id.slice(nodeModulesDir.length) + "\n" + code + "\n//#endregion"
            }
        },
    ],
}