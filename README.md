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

This project uses a module or feature-based structure which is inspired by the [bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md) structure.

```
src
|
+-- api               # graphql queries/mutations/fragments
|
+-- components        # shared components used across the entire application
|
+-- modules           # feature-based modules
|
+-- hooks             # shared hooks used across the entire application
|
+-- test              # test utilities and mocks
|
+-- types             # shared types used across the application (auto-generated from the graphql schema)
|
+-- utils             # shared utility functions
```


Inner structure of a module:

```
src/modules/awesomeModule
|
+-- components  # components scoped to a specific feature
|
+-- hooks       # hooks scoped to a specific feature
|
+-- myTypes.ts  # typescript types used within the feature, with appropriate filename
|
+-- myUtils.ts  # utility functions for a specific feature, with appropriate filename

```

#### Guidelines for categorization
* Prefer to co-locate code that deals with the same type of thing into a shared `module`, even if the components are rendered in different parts of the application. For example, the Project Services table and Client Services table can live in the same "service" module.
* A `module` should typically contain more than just a couple of files, but not so many that it becomes difficult to navigate or understand.
* If two potential features are highly interdependent and frequently change together, consider combining them into a single `module`.
* The top-level `components` folder should contain generic components that are used across the application. For the most part, they should not be domain-specific.
* Components in the top-level `components` dir should not have dependencies on `module` code.
* It should be clear what the purpose of a module is and how to use it. An engineer should be able to quickly understand what the module's entry-points are without needing to understand the internals of the module. If this is not obvious from code structure or storybook, include a brief README.md in the module dir with examples/explanation.

#### Examples of modules
* `modules/service` - includes the service table components, and service-related pages (e.g. ProjectServicesPage, EnrollmentServicesPage)
* `modules/bulkServices` - includes components to support the bulk service assignment feature. This is separated out from the `services` module to keep the size manageable, and because they are relatively independent implementations.
* `modules/scanCards` - components to support the Scan Card feature

