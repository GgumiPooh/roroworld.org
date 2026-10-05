<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 0. Project Documentation

## 0.1. Read every document in `docs/`

Before starting any task, read **all** files in the `docs/` directory. They define the product requirements, architecture decisions, and design rules for this project, and they take precedence over assumptions. Re-read them when the task touches an area they cover.

## 0.2. Documentation is English, product copy is Korean

`docs/` and this file are written in English deliberately, for LLM legibility. The product itself ships **Korean-only UI**. Korean string literals that appear inside these documents are the exact user-facing copy — reproduce them verbatim in code and never translate them to English. New user-facing strings are authored in Korean.

## 0.3. Keep `docs/` current

When a decision changes or a requirement is completed, update the corresponding document in `docs/` in the same change.

## 0.4. Korean particles come from `es-hangul`

A particle that follows an interpolated value MUST be chosen with `josa` from `es-hangul` (`josa("3개", "을/를")`, or `josa.pick` for the particle alone). **Never compute 받침 by hand**, and never bake one form into a sentence two different words reach.

# 1. UI Component Conventions

## 1.1. Props type

Every UI component MUST declare a TypeScript `type` alias named `{ComponentName}Props` and use it as the component's parameter type. `{ComponentName}Props` MUST include `className?: string`.

A component that renders no DOM element of its own is exempt from the `className` requirement, and only that requirement. The `{ComponentName}Props` alias itself is still required.

## 1.2. Outer className

Apply the `className` field of `{ComponentName}Props` (§ 1.1.) to the component's outermost rendered element (the root wrapping `<div>` or equivalent tag). Do not forward it to any inner child.

## 1.3. Inner element className

To expose styling for a non-outermost child element, declare an additional optional prop on `{ComponentName}Props` (§ 1.1.) named `{elementName}ClassName: string` (e.g. `labelClassName`, `iconClassName`) and apply it to that specific child.

## 1.4. Children prop

When `{ComponentName}Props` (§ 1.1.) needs `children`, type it via `PropsWithChildren` from `react`; do not declare `children: ReactNode` manually. Import the symbol directly (`import { PropsWithChildren } from "react"`); the namespaced form `React.PropsWithChildren` is forbidden.

# 2. UI Component Sourcing

## 2.1. shadcn / primitive precedence

Before authoring a primitive UI component (button, input, dialog, popover, etc.) from scratch, check standard accessible primitives (Radix, Headless UI, shadcn).

## 2.2. Design conformance

Installed components are a scaffold. Rewrite visual decisions — colors, typography, radii, spacing, borders — to satisfy design tokens. No registry default may remain in the committed component.

## 2.3. Convention conformance

Installed components are subject to § 1.1.–§ 1.3. Refactor the props type, outer `className` placement, and inner-element `className` props to match before first use.

## 2.4. Overlays are props-driven, not composed

Overlay components exported from `@/shared/ui` (`Modal`, `BottomSheet`, `Overlay`) MUST expose a flat props API — `isOpen`, `onClose`, `children` — and perform primitive composition internally. Screen code MUST NOT assemble primitives directly.

# 3. TypeScript Type Conventions

## 3.1. Nullish unions

Replace `T | null`, `T | undefined`, and `T | null | undefined` with `Nullable<T>`, `Optional<T>`, and `Maybe<T>` from `@/shared/lib`. Wrap the full non-nullish operand: `Nullable<A | B>`, not `A | Nullable<B>`.

## 3.2. Id and Data validation

IDs and request inputs MUST be strictly validated via Zod schemas at runtime boundaries (Route Handlers and server actions). No `any` type is permitted.

# 4. Responsive Policy

## 4.1. Responsive scale

The mobile layout is the base; desktop scaling resolves through Tailwind `sm:`, `md:`, and `lg:` classes.

## 4.2. Pointer affordances and keyboard input

Desktop users see mouse `click` handlers, plus `hover:`, `active:`, and `focus-visible:` states on every interactive element.
Every `keydown` handler guards on `isComposing`, because a Hangul IME owns the keystrokes that settle a syllable.

# 5. Styling

## 5.1. Semantic tokens only

Use only the semantic color tokens defined in `src/app/styles/globals.css` and `@theme`. Raw ad-hoc colors outside the defined palette are forbidden.

# 6. Server Code

## 6.1. server-only

Any module that touches the database, session secrets, or R2 credentials MUST `import "server-only"` at the top.

## 6.2. Required environment variables

Read a required environment variable with `ensureEnv("NAME")` from `@/shared/config`, never `process.env.NAME` directly. It treats a blank value as missing, so a half-filled `.env` fails at the first call instead of surfacing much later as an opaque error.

## 6.3. Database access

Obtain the connection with `getDb()` from `@/shared/db`.

## 6.4. Session and Route Handlers

Route Handlers check session authentication through `@/shared/auth` and return standard HTTP 401 on unauthorized access.

# 7. Comments

## 7.1. No comments that restate the code

Do not write a comment a reader could infer from the code itself. Naming and structure carry _what_ the code does; a comment that paraphrases the next line is noise that goes stale.

## 7.2. What a comment is for

Comment only what the code cannot express: the reason a non-obvious decision was made, a constraint imposed from outside, or a consequence that is invisible at the call site.

## 7.3. Comment format

Every comment that survives § 7.1. MUST be tagged: `// {TYPE}: content`. `TYPE` is exactly one of:

| Type   | Use                                                                      |
| ------ | ------------------------------------------------------------------------ |
| `TODO` | Work deliberately left undone, and what unblocks it                      |
| `INFO` | The rationale or external constraint behind the code as written          |
| `WARN` | A trap — something that breaks if the code is changed in the obvious way |

This applies to explanatory comments; JSDoc blocks (`/** … */`) documenting an exported symbol's contract are not comments in this sense and take no tag.

## 7.4. One line per comment

A comment MUST occupy exactly one line. Never wrap it across lines, and never stack several lines into one block.

# 8. Duration Literals

## 8.1. Shared constants precedence

Do not write bare numeric duration literals in application code. Use the duration constants exported from `@/shared/lib`, such as `A_SECOND`, `A_MINUTE`, `AN_HOUR`, and `A_DAY`.

## 8.2. Unit conversion

The constants in § 8.1. are millisecond values. When an API expects seconds, convert explicitly at the call site, e.g. `A_DAY / A_SECOND`. Do not pass a millisecond constant to a seconds-based API.
