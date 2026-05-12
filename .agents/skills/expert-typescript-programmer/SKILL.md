---
name: expert-typescript-programmer
description: Use when designing, implementing, refactoring, or reviewing TypeScript features and APIs that should be robust, maintainable, type-safe, and efficient. Applies to TypeScript source code, tsconfig choices, declaration files, library/package APIs, large-codebase performance, and agent-written feature work.
---

# Expert TypeScript Programmer

Use this skill before making meaningful TypeScript changes. It distills official TypeScript Handbook, TSConfig, declaration-file, and TypeScript wiki performance guidance into an agent workflow.

## Operating Principles

1. Read the local project first: package scripts, `tsconfig*.json`, framework conventions, module format, lint rules, and nearby code.
2. Preserve the runtime contract. TypeScript types describe JavaScript behavior; they do not add runtime checks.
3. Prefer sound, narrow types over broad escape hatches. Treat `any`, assertions, non-null assertions, and `@ts-ignore` as temporary or boundary-only tools.
4. Model states explicitly. Use unions, discriminants, guards, and exhaustive checks instead of optional fields that imply invalid combinations.
5. Let inference work inside implementations, but annotate exported functions, public APIs, callbacks, and complex return types when that improves readability, stability, or compiler performance.
6. Keep types easy for humans and the compiler: name complex types, avoid huge unions, prefer interface extension for object composition, and split large projects deliberately.
7. Verify with the repo's own checks: typecheck, tests, lint/build, or the closest available script. If no check exists, say so.

## Reference Loading

Load only what the task needs:

- [references/robust-code.md](references/robust-code.md): everyday coding practices, narrowing, object types, generics, assertions, declaration/API design.
- [references/tsconfig.md](references/tsconfig.md): strictness and configuration flags for safer projects.
- [references/performance.md](references/performance.md): compile/editor performance, easy-to-compile type design, project references, troubleshooting.
- [references/sources.md](references/sources.md): official TypeScript sources used to build this skill.

## Feature Workflow

1. Identify boundary types: input data, external APIs, persisted values, public exports, package entrypoints, callbacks, and error paths.
2. Choose representation:
   - Use discriminated unions for variants with different fields.
   - Use `unknown` at untrusted boundaries, then narrow.
   - Use `object`/specific object shapes instead of boxed primitives or broad `Object`.
   - Use `readonly` and immutable data shapes where callers should not mutate values.
3. Implement runtime validation or guards where values come from outside the type system.
4. Keep type machinery proportional. Reach for conditional, mapped, indexed-access, and template-literal types when they simplify public usage; avoid cleverness that obscures behavior.
5. Review the diff for type escapes and configuration drift before finishing.

## Review Checklist

- `strict` expectations are respected; new code does not rely on implicit `any` or unchecked nullish values.
- Assertions are justified by nearby runtime facts or replaced with guards.
- Index access handles possible `undefined` when keys are not guaranteed.
- Optional properties mean absence; if `undefined` is an allowed value, the type says so.
- Overloads are ordered specific-to-general, or replaced by optional parameters/unions when return behavior permits.
- Exported APIs have stable names and annotations where inference would leak complex anonymous types.
- Large object type composition uses `interface extends` where appropriate instead of deep intersections.
- Large unions, distributive conditional types, and generated-looking type expansions are avoided or named.
- Module settings match the runtime/bundler, especially Node ESM/CJS behavior.
- Typecheck/test commands were run or a limitation is reported.
