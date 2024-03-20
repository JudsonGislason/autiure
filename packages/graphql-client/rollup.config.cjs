import dts from "rollup-plugin-dts";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import replace from "@rollup/plugin-replace";

import * as pkg from "./package.json";

const mainSrcInput = "src/index.ts";
const clientSrcInput = "src/graphql-client/index.ts";

export function getPlugins({ tsconfig, minify } = {}) {
  return [
    replace({
      preventAssignment: true,
      ROLLUP_REPLACE_CLIENT_VERSION: pkg.version,
    }),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: tsconfig ? tsconfig : "./tsconfig.build.json",
      outDir: "./dist/ts",
    }),
    ...(minify === true ? [terser({ keep_fnames: new RegExp("fetch") })] : []),
  ];
}

const packageName = pkg.name.substring(1);
const repositoryName = pkg.repository.url.split(":")[1].split(".")[0];
export const bannerConfig = {
  banner: `/*! ${packageName} -- Copyright (c) 2023-present, Shopify Inc. -- license (MIT): https://github.com/${repositoryName}/blob/main/LICENSE */`,
};

const config = [
  {
    input: clientSrcInput,
    plugins: getPlugins({
      minify: true,
      tsconfig: "./tsconfig.build.umd.json",
    }),
    output: [
      {
        file: "./dist/umd/graphql-client.min.js",
        format: "umd",
        sourcemap: true,
        name: "ShopifyGraphQLClient",
        ...bannerConfig,
      },
    ],
  },
  {
    input: clientSrcInput,
    plugins: getPlugins({
      tsconfig: "./tsconfig.build.umd.json",
    }),
    output: [
      {
        file: "./dist/umd/graphql-client.js",
        format: "umd",
        sourcemap: true,
        name: "ShopifyGraphQLClient",
        ...bannerConfig,
      },
    ],
  },
  {
    input: mainSrcInput,
    plugins: getPlugins(),
    output: [
      {
        dir: "./dist",
        format: "es",
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].mjs",
      },
    ],
  },
  {
    input: mainSrcInput,
    plugins: getPlugins(),
    output: [
      {
        dir: "./dist",
        format: "cjs",
        sourcemap: true,
        exports: "named",
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    ],
  },
  {
    input: "./dist/ts/index.d.ts",
    output: [{ file: "dist/graphql-client.d.ts", format: "es" }],
    plugins: [dts.default()],
  },
];

export default config;
