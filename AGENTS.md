# Open Path HMIS Warehouse Front-end

SPA in TypeScript, React 18, MUI, Apollo GraphQL Client, Vite. **No backend in this repo** — a running hmis-warehouse backend is required for the app to function.

## Commands

```sh
yarn test           # Vitest, single run. Scope it: yarn test src/modules/form
yarn lint           # ESLint --fix (lint:check for CI, no fixing)
yarn check-types    # tsc --noEmit
yarn format         # Prettier --write
```

## Documentation router

Read the doc before working in the area.

| Working on... | Read |
| --- | --- |
| Setup, dev server, SSO/oauth-proxy mode, backend config, package upgrades | `README.md` |
| Where a file belongs / adding a module | `README.md` "Project Structure" |
| Apollo/GraphQL conventions | `.cursor/rules/react-graphql-apollo-client.mdc` |
| Link chain, retries, cache normalization | `src/providers/apolloClient.tsx` |
| Auth, session expiry, cross-tab session sync | `src/modules/auth/hooks/README.md` |
| Bumping dependencies | `docs/DEPENDENCY_UPGRADES.md` |

## Non-obvious rules

- **`src/types/gqlTypes.ts` is generated — never edit it.** After changing any `.graphql` file in `src/api/operations/`, or after a backend schema change, run `SCHEMA_PATH=/path/to/hmis-warehouse/drivers/hmis/app/graphql/schema.graphql yarn graphql:codegen`. Each operation yields a typed hook (`GetClient` → `useGetClientQuery`) imported from `@/types/gqlTypes`.
- **Route ids are obfuscated** (when `PUBLIC_PROTECTED_IDS=true`). Always build paths with `generateSafePath()` (`@/utils/pathEncoding`) and read params with `useSafeParams()` (`@/hooks/useSafeParams`), never bare `generatePath`/`useParams`.
- **Most data entry is data-driven, not hardcoded.** Assessments, services, client/enrollment records and case notes render from `FormDefinitionJson` via `DynamicForm` in `src/modules/form`; value transformation lives in `formUtil.ts`. `src/modules/formBuilder` is the admin UI for editing definitions. Before adding a form field, check whether it belongs in a definition (seeded on the backend) instead.
- **Every new page needs an authorization gate** in `src/routes/protected.tsx`: a route wrapper (`RootPermissionsFilter`, `accessWrappers/*`), or `src/modules/permissions/useHasPermissionsHooks.tsx` when that is too coarse.
- Prefer `src/modules/dataFetching` helpers (`GenericTableWithData`, `LiveSelect`, `LiveTextInput`, `GenericMutationButton`, `DeleteMutationButton`) over hand-rolling table pagination/filtering or inline mutation buttons.
