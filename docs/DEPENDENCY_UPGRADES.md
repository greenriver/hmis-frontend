# Dependency upgrades

Guidance for keeping npm dependencies current without unnecessary churn. Security work is covered in [Addressing Vulnerability alerts](#addressing-vulnerability-alerts).

## Core packages

These are the main dependency areas for this app. Use this list when scoping maintenance work or estimating upgrade risk.

| Area                 | Packages / notes                                                                                                                                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React**            | `react`, `react-dom`; keep `@types/react` and `@types/react-dom` in step.                                                                                                                                                                                         |
| **TypeScript**       | `typescript`; major bumps may surface new type errors across the codebase.                                                                                                                                                                                        |
| **Material UI**      | `@mui/*`, `@emotion/*`, `material-ui-popup-state`; large UI surface                                                                                                                                                                                               |
| **Apollo & GraphQL** | `@apollo/client`, `apollo-link-sentry`, `graphql`, `graphql-tag`; Apollo major/minor upgrades should be done alone due to cache and API impact. Dev: `@graphql-codegen/*` and related codegen packages. Bump together and re-run `graphql:codegen` after changes. |
| **Vite & build**     | `vite`, `@vitejs/plugin-react`, `@sentry/vite-plugin`, `vite-plugin-mkcert`, `rollup-plugin-visualizer`.                                                                                                                                                          |
| **Node**             | Version is pinned in [`.nvmrc`](../.nvmrc) and `engines` in `package.json`. Treat Node bumps as standalone changes.                                                                                                                                               |
| **Storybook**        | `storybook`, `@storybook/*`, `storybook-addon-*`, `@chromatic-com/storybook`; keep Storybook packages on a single release line when possible.                                                                                                                     |
| **Lint & format**    | `eslint`, `prettier`, `typescript-eslint`, `eslint-plugin-*`, `husky`, `lint-staged`.                                                                                                                                                                             |
| **Testing**          | `vitest`, `playwright`, `axe-playwright`, `@storybook/test-runner`, Storybook test addons.                                                                                                                                                                        |
| **Routing**          | `react-router-dom`.                                                                                                                                                                                                                                               |
| **Forms**            | `react-hook-form`, `imask` / `react-imask`, `react-number-format`.                                                                                                                                                                                                |
| **i18n**             | `i18next`, `react-i18next`, `i18next-http-backend`.                                                                                                                                                                                                               |
| **Maps & editors**   | `leaflet`, `react-leaflet`, `ace-builds`, `react-ace`, `react-pdf`. Upgrade with their feature areas in mind.                                                                                                                                                     |
| **Utilities**        | `date-fns`, `lodash-es`, `uuid`, `dompurify`, `cross-fetch`, etc.                                                                                                                                                                                                 |

## Do we need to upgrade this?

Use these criteria when deciding whether to include a package in a maintenance pass or leave it alone.

| Situation                 | Typical action                                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Security**              | Follow process for [Addressing Vulnerability alerts](#addressing-vulnerability-alerts). Priority is driven by triage, not the calendar. |
| **Unblocks work**         | Upgrade when a bugfix or feature is required for a ticket or integration.                                                               |
| **Unmaintained or EOL**   | Plan an upgrade to a supported line to keep receiving patches.                                                                          |
| **Planned maintenance**   | On a **regular cadence**, refresh versions that are still supported but drifting, so future jumps stay smaller.                         |
| **Cosmetic version only** | No urgent need; optional unless it reduces noise or aligns a cluster (e.g. one MUI package behind the rest).                            |

Skipping an upgrade is acceptable when risk outweighs benefit. Document deferred major work with a ticket if it should not wait indefinitely.

## Cadence

| Type                               | Cadence                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| **Planned dependency maintenance** | **Regular cadence**; tracked with tickets and rotate ownership as fits the team.       |
| **Security**                       | Ongoing; at least **once per dev-support rotation** for monitoring/triage (see below). |
| **Ad hoc**                         | As needed for features, fixes, or compatibility.                                       |

## How to group upgrades

- **Default:** Upgrade **by ecosystem** in a single PR (e.g. Vite + related plugins; Storybook cluster; lint/test toolchain together; React + type packages).
- **Large or risky ecosystems:** Give **MUI**, **Apollo**, **Node** their own PRs so failures are easier to attribute, and review stays focused.
- **Avoid** one PR that mixes unrelated ecosystems (e.g. MUI + Apollo + Storybook) when possible

## Maintenance cycle checklist

1. **Scope**: Choose ecosystem groups for this cycle, create tickets for major upgrades
2. **Upgrade**: Upgrade dependencies and refresh the lockfile with the usual Yarn workflow. When available, follow Migration guides and review changelogs.
3. **Verify** — Types, lint, tests, build; manual spot-check for risky areas.
4. **PR** — Short summary: what changed, why now, release notes links for majors, any manual QA notes.

## Addressing Vulnerability Alerts

The engineer on dev-support owns **monitoring**, **triage**, and **resolution** of vulnerability alerts for this frontend.

### Monitor

- Run `yarn audit`, and/or review **Dependabot** alerts in the repo.
- **Do not** rely on merging Dependabot PRs as-is. Instead, create targeted upgrades that match team practice.
- **Dismiss** Dependabot alerts when a fix is started, with a link to the PR.

### Triage

- Read the advisory and decide whether it applies to our usage and how urgent it is.
- **High urgency** may require a hotfix branch.
- **Lower urgency** can be fixed on the current development branch as part of normal work.

### Resolve

1. **Direct dependency with a published fix:** Run `yarn upgrade <package>`. If `package.json` allows a newer patch/minor, the lockfile may pick up a fix. Re-run `yarn audit` to confirm the finding is gone.
2. **Still flagged:** The vulnerable code may be **transitive**. Run `yarn why <package>` to see the dependency graph (example: `yarn why vite`). Upgrade **intermediate** packages that pull in the fixed version, then re-audit.
3. **After upgrades:** Run `yarn dedup`, test affected areas, open a **PR**. A separate ticket is **not** required unless the fix is a major upgrade or work must be deferred.
4. **Deferred fixes:** If impact is low or the fix is non-trivial, **open a bug ticket** so the alert is tracked and eventually cleared. Keep the Dependabot alert open until ticket is reviewed by team.
