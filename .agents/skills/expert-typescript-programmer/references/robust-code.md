# Robust TypeScript Code

Official sources: TypeScript Handbook pages for Everyday Types, Narrowing, Object Types, Generics, type manipulation, Modules, and declaration-file Do's and Don'ts.

## Safety Defaults

- New TypeScript code should favor strict checking. The Handbook says strictness generally pays for itself over time and gives better checks/tooling.
- Avoid `any` in finished TypeScript. It disables checking for values that use it. Use `unknown` when accepting values whose type is not yet known, then narrow before use.
- Type assertions, including double assertions through `unknown` or `any`, are compile-time only. They do not validate at runtime. Use them only when the runtime fact is guaranteed elsewhere.
- Avoid non-null assertions unless control flow or an invariant truly proves presence. Prefer explicit checks that help both readers and TypeScript.
- Use primitive types `string`, `number`, `boolean`, and `symbol`, not boxed `String`, `Number`, `Boolean`, `Symbol`, or broad `Object`.

## Inference and Annotations

- Let TypeScript infer local variables and simple implementation details.
- Add annotations for function parameters, exported/public return types, package boundaries, callbacks, and places where inference produces a complex or unstable type.
- Annotation can be both documentation and a guard against accidentally changing an exported API.

## Narrowing and Runtime Facts

- Narrow with normal JavaScript checks: `typeof`, truthiness where appropriate, equality checks, `in`, `instanceof`, assignments, control flow, and user-defined type predicates.
- Remember that narrowing follows runtime behavior. Do not encode a type relationship that runtime code does not actually enforce.
- Use discriminated unions for variants. Give every variant a shared literal property such as `kind`, `type`, or `status`, then switch on that property.
- Use exhaustive `never` checks in switches over closed unions:

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}
```

## Objects and Data Shapes

- Prefer named `interface` or `type` declarations for reusable object shapes.
- Use optional properties for properties that may be absent. With stricter config, absence and `undefined` can be distinct.
- Use `readonly` to communicate and enforce that callers should not reassign a property. It is a type-level restriction, not deep runtime immutability.
- Use index signatures only when truly unknown keys are supported. Pair them with safer compiler options when possible.
- Let excess property checks catch misspelled object literal keys. Avoid bypassing them with broad intermediate variables or assertions unless intentional.

## Generics

- A generic parameter should carry information from one position to another: input to output, key to value, element to container, etc. Do not introduce unused type parameters.
- Constrain generics when the implementation relies on a capability:

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

- Prefer generic defaults when they remove repetitive overloads without hiding important behavior.
- Keep advanced type programming small and named. Conditional, mapped, indexed-access, and template-literal types are powerful, but large anonymous compositions are hard to read and can slow checking.
- For template-literal unions, official docs recommend ahead-of-time generation for large string unions.

## API and Declaration Design

- Use `void` for callback return values that are intentionally ignored.
- Do not write overloads that differ only by callback arity; use the maximum arity since callbacks may ignore parameters.
- Order overloads from most specific to most general.
- Prefer optional parameters over overloads that only add trailing parameters, when return type is the same.
- Prefer union parameters over overloads that differ by one argument type and have compatible behavior.
- Publish generated declarations with source packages when a package's own source can generate types.

## Modules

- A file with a top-level `import` or `export` is a module; a file without one is a script in global scope.
- Prefer ES module syntax for modern TypeScript unless the project has an established CommonJS/runtime reason.
- Choose compiler module options to match the actual runtime host or bundler. Even with `noEmit`, module settings affect type checking and IntelliSense.

## Boundary Pattern

At untrusted boundaries such as JSON, request bodies, storage, environment variables, or `catch` values:

1. Accept `unknown`.
2. Validate runtime shape.
3. Return a narrowed domain type.
4. Keep the rest of the code free of assertions.

```ts
interface User {
  id: string;
  name: string;
}

function isUser(value: unknown): value is User {
  return typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    typeof value.id === "string" &&
    typeof value.name === "string";
}
```
