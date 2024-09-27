# HMIS Front End

## Application Stack
* Node JS
* React
* TypeScript
* Apollo GraphQL Client
* Material UI
* GraphQL Codegen
* Storybook 8
* Chromatic
* Vite
* yarn
* prettier / eslint
* [hmis-warehouse](https://github.com/greenriver/hmis-warehouse) backend (Rails, ruby-graphql)

## Developer Installation

### Install Node, NPM, and Yarn

1. Install NVM

   ```sh
   brew update
   brew install nvm
   # Follow the instructions to update your shell configuration file.
   ```

2. Install the Node version specified in `.nvmrc`

   ```sh
   nvm install
   nvm use
   ```

3. Enable Yarn
   ```sh
   corepack enable
   ```

### Run local development server

1. Add to `/etc/hosts`:

   ```sh
   ::1         hmis.dev.test
   127.0.0.1   hmis.dev.test
   ```

2. Install npm dependencies

   ```sh
   yarn install
   ```

3. Run vite dev server with live reload

   ```sh
   yarn dev
   ```

### Test, lint, format, and type check

```sh
yarn test
yarn lint
yarn format
yarn tsc
```

### Build for Production

Preview production build

```sh
yarn build && yarn preview
```

### Updating Codegen

Use the `graphql:codegen` script to update generated types.

```sh
SCHEMA_PATH=/path/to/warehouse/schema.graphql yarn graphql:codegen
```

> 💡 If you add `export SCHEMA_PATH=/my-dev-path/hmis-warehouse/drivers/hmis/app/graphql/schema.graphql` to your shell configuration file (eg .zshrc, .bashrc), then you only need to run `yarn graphql:codegen`

### Upgrading Yarn

If you used `corepack` to install yarn, you can also upgrade it using corepack. The Yarn version is not pinned in the repo.

```sh
corepack prepare yarn@<version> --activate
```

### Upgrading NPM Packages

To add or grade an NPM package, you can edit the `package.json` OR run `yarn add` OR run `yarn upgrade` OR run `yarn upgrade-interactive`.

```sh
# 1. edit package.json, or run yarn add/upgrade
# 2. download packages and update the yarn.lock
yarn install
# 3. remove duplicate packages
yarn yarn-deduplicate
# 4. always commit changes to these files
git add yarn.lock package.json
```


### Capybara System Tests

See the [HMIS README](https://github.com/greenriver/hmis-warehouse/blob/stable/drivers/hmis/README.md) in the Warehouse repo for instructions on running end-to-end Capybara tests.

## Backend configuration

The frontend communicates with the [OpenPath warehouse](https://github.com/greenriver/hmis-warehouse).
Once you have the warehouse development environment up, follow the steps below to configure it for HMIS.

# Open Path Warehouse Setup for HMIS

Set these variables in `hmis-warehouse/.env.local` to enable the HMIS GraphQL endpoints:

```sh
ENABLE_HMIS_API=true
HMIS_HOSTNAME=hmis.dev.test
```

Next, run the db seed to set up the HMIS Data Source and an HMIS Administrator user.

```sh
rails db:seed
```

You should see the HMIS data source here: https://hmis-warehouse.dev.test/data_sources

## HMIS Admin

The above will enable the warehouse API and grant a user access to
[HMIS Admin](https://hmis-warehouse.dev.test/hmis_admin/roles) in the
right-rail of the warehouse UI, and the remaining configuration is done via the UI.

Use this tool to grant yourself further access by enabling additional permissions on the "HMIS Administrator" role.

## Tips & Tricks

#### Assessment Forms Configuration

The HMIS asesssment form definitions are created with the command

```sh
rails driver:hmis:seed_definitions
```

This must be run once to populate the database, and re-run any time the
form definitions are changed.

#### Custom Services Seed

Run this to setup custom services:

```sh
rails driver:hmis:seed_service_types
```

#### Changing the GraphQL Schema

After making any change to the GraphQL schema, run this:

```sh
rails driver:hmis:dump_graphql_schema
```

To pick up the local schema changes on the frontend, run the `graphql:codegen` script (see above).

## Project Structure

This project follows the [bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md) structure.

```
src
|
+-- api               # graphql queries/mutations/fragments
|
+-- app               # application layer containing:
|   +-- App.tsx              # main application component
|   +-- AppProvider.tsx      # application provider that wraps the entire application
|   +-- protectedRoutes.ts   # define routes for the authorized applciation
+-- assets            # assets folder can contain all the static files such as images, fonts, etc.
|
+-- components        # shared components used across the entire application
|
+-- config            # global configurations, exported env variables etc.
|
+-- modules           # feature based modules
|
+-- hooks             # shared hooks used across the entire application
|
+-- providers         # shared contexts and providers? (added)
|
+-- test              # test utilities and mocks
|
+-- types             # shared types used across the application
|
+-- utils             # shared utility functions
```

Important modules
```
app
components             # no components, just a dir
components/elements    # common components
components/input       # base input components that are used across the app
components/layout      # layout components that are used across the app
components/table       # table components that are used across the app (could be a module or just in elements/ ?)
components/pages       # ***keep or move to modules or src/app/pages?? these are not re-used

modules:

modules/admin                  # everything related to top-level Admin page (Should be further split out)
modules/assessments
modules/audit
modules/auth
modules/caseNotes
modules/client        # components used on client overview page, plus client alerts. could be divided
modules/clientMerge
modules/dataFetching  # doesn't really fit in, not a feature. remove?
modules/enrollment    # lots of enrollment components including staff assignment. could be divided
modules/errors
modules/external/mci  # other external components could go here, or rename to just externalMci or mci
modules/form          # BIG. all DynamicForm/DynamicView related components, plus some enrollment/client-specific components that should go in modules, I think. should be divided. also contains rhf components that shouold probably be a different module.
modules/formBuilder
modules/hmis          # "hmis" atomic elements, like ClientDobAge, EnrollmentStatus, HmisField etc. I guess these should just be moved to src/components/elements
modules/hmisAppSettings
modules/household     # components related to creating/editing/viewing household membership
modules/permissions   # should move src/components/accessWrappers to here
modules/projects      # BIG, should be divided. contains referral components that should be moved to referral module. maybe project configuration components could have their own module too.
modules/referrals
modules/scanCards
modules/search
modules/services     # includes bulk- and individual- service stuff, could be split to bulkServices/bedNights module
modules/systemStatus
modules/units
modules/userDashboard

new modules:
modules/clientDashboard        # NEW (was src/components/clientDashboard)
modules/theme                  # NEW (was in src/config)
```

Topics for discussion
* Moving `ProjectServices` table/page from `modules/projects` modules to `modules/services` (example). I think I like having all Service-related tables/pages in one module, because they share column configurations. And of course the generic table is in `src/components`.
* Modules themselves don't follow the consistent inner structure, I would propose updating them.
* Do we want to recommend flat structure of components within modules? So things lie flat in storybook.


Inner structure of modules
```
src/modules/awesomeModule
|
+-- components  # components scoped to a specific feature
|
+-- hooks       # hooks scoped to a specific feature
|
+-- types       # typescript types used within the feature
|
+-- utils       # utility functions for a specific feature

```