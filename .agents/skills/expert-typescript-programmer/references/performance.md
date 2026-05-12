# TypeScript Performance

Official source: TypeScript wiki Performance page maintained in the Microsoft TypeScript repository, plus TSConfig pages for related options.

## Easy-to-Compile Code

- Prefer `interface extends` for composing object types instead of large intersection aliases. Interfaces create a flatter object type, detect conflicts, display better, and allow relationship caching.
- Add explicit return annotations in hot or exported areas if inference creates large anonymous types or expensive declaration emit.
- Name complex conditional/mapped types so the compiler can cache and display them more effectively.
- Avoid very large unions where a base interface plus subtypes would model the same domain. Large unions can require repeated or pairwise comparisons.
- Do not inline complex conditional return types inside frequently used call signatures. Extract them:

```ts
type FooResult<U, T> =
  U extends TypeA<T> ? ProcessTypeA<U, T> :
  U extends TypeB<T> ? ProcessTypeB<U, T> :
  U;

interface SomeType<T> {
  foo<U>(value: U): FooResult<U, T>;
}
```

## Project Structure

- Split non-trivial codebases into projects with project references when scale hurts editor or build performance.
- In monorepos, mirror package dependencies with project references where practical.
- Aim for projects that are meaningfully sized and edited together. Too few projects can overload the editor; too many can duplicate overhead.
- Separate tests from product code when it prevents product projects from loading test-only dependencies or globals.

## tsconfig Performance

- Keep `include` narrow and source-focused.
- Avoid source directories that contain `node_modules`, build outputs, generated artifacts, or other projects' source.
- Set `types: []` or a specific `types` list when automatic global type inclusion is unnecessary or conflicting.
- Use `incremental` for repeated builds.
- Consider `skipLibCheck` for faster builds, but recognize it can hide declaration-file conflicts or misconfiguration. Prefer fixing dependency/type duplication when feasible.
- Build with `strictFunctionTypes` (usually via `strict`) for faster variance checks.

## Toolchain Pattern

- If transpilation is handled by a bundler or another compiler, run type-checking concurrently or separately where the repo supports it.
- For isolated emit pipelines, make sure code is compatible with single-file transpilers (`isolatedModules`/related settings as established by the repo).

## Troubleshooting Slow TypeScript

Use official diagnostics before guessing:

- `tsc --extendedDiagnostics`: time and memory summary.
- `tsc --showConfig`: inspect the final config.
- `tsc --listFilesOnly`: see which files are in the program.
- `tsc --explainFiles`: understand why files are included.
- `tsc --traceResolution`: debug module/type resolution.
- Run `tsc` alone to separate TypeScript cost from bundler/test-runner cost.
- Disable editor TypeScript plugins if editor latency does not reproduce in CLI.
- Take a TypeScript performance trace for persistent compiler or editor issues.

## Agent Heuristics

- If a generated type is hard for you to read, it is probably hard for the compiler and future maintainers too.
- Prefer boring, named, composable types for feature work.
- Only optimize type-level performance after identifying scale, a hotspot, or a known problematic pattern.
