# TypeScript Configuration

Official sources: TSConfig reference pages for `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `useUnknownInCatchVariables`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`, `moduleResolution`, `incremental`, and the Handbook module/project configuration pages.

## Recommended Safety Baseline

For new or actively maintained TypeScript code, prefer:

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "useUnknownInCatchVariables": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

Adopt these incrementally in existing codebases if enabling them at once would create noisy churn.

## Flag Guidance

- `strict`: enables a family of stronger checks for correctness. Future TypeScript versions may add stricter checks under this umbrella, so upgrades can reveal new errors.
- `noImplicitAny`: part of `strict`; prevents places TypeScript cannot infer from silently becoming `any`.
- `strictNullChecks`: part of `strict`; forces explicit handling of `null` and `undefined`.
- `strictFunctionTypes`: part of `strict`; also enables faster variance-related assignability checks in some cases.
- `exactOptionalPropertyTypes`: treats `prop?: T` as absent-or-`T`, not automatically `T | undefined`.
- `noUncheckedIndexedAccess`: adds `undefined` to values read through keys that are not known to exist.
- `useUnknownInCatchVariables`: catch variables are `unknown`, requiring verification before use as `Error`.
- `noImplicitOverride`: requires `override` when subclass members override base members, catching refactor drift.
- `noPropertyAccessFromIndexSignature`: requires bracket access for fields only known through an index signature, making uncertainty visible.

## Module and Emit Choices

- `moduleResolution: "node16"` or `"nodenext"`: use for modern Node projects that need Node's ESM/CJS behavior.
- `moduleResolution: "bundler"`: use for bundler-driven projects where package `"imports"`/`"exports"` are respected and relative import extensions are not required.
- Avoid `classic` module resolution in modern projects.
- `verbatimModuleSyntax`: simplifies import elision by preserving imports/exports without a `type` modifier and dropping type-only imports/exports. Prefer explicit `import type` / `export type` where applicable.
- Choose `module` based on the actual host. TypeScript needs accurate module information even when `noEmit` is true.
- Use `declaration`/`declarationMap` for libraries where consumers need stable public types and source navigation.
- Use `sourceMap`/`inlineSources` according to the repo's debugging/deployment practice.

## Project Size and File Inclusion

- Keep `include` focused on source folders. Avoid globs that sweep in build output, dependency folders, generated artifacts, or unrelated packages.
- If adding an `exclude` list, explicitly exclude `node_modules` because custom excludes replace defaults in ways that can surprise monorepos.
- Use the `types` option to limit automatic global `@types` inclusion, especially for test configs or packages with conflicting globals.
- Use project references for non-trivial workspaces, libraries, and monorepos where independent packages/projects should typecheck separately.
- `incremental` stores project graph information in `.tsbuildinfo` files to speed later builds. It is enabled by default with `composite`.

## Config Review Questions

- Does this package run in Node, a browser, an edge worker, a bundler, or multiple targets?
- Are emitted modules and resolved modules the same format the runtime expects?
- Are tests, generated files, and build outputs part of the typecheck by accident?
- Are global types intentionally included?
- Are strictness gaps local and justified, or inherited inertia?
