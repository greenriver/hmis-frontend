# HMIS Front End

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

3. Run dev server with live reload

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
SCHEMA_PATH=<path to schema.graphql> yarn graphql:codegen
```

### Cypress E2E tests

These tests run against a real warehouse backend. Make sure you have the backend running at `https://hmis-warehouse.dev.test`.

1. Run `rails driver:hmis:seed_e2e` in the warehouse repo
2. Run `yarn cypress open` in the frontend repo


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