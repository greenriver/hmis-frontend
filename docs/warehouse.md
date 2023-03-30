# Warehouse Setup

The HMIS server components are enabled via warehouse environment variables:

```sh
ENABLE_HMIS_API=true
HMIS_HOSTNAME=hmis.dev.test
```

And, with those configured, the database seeds script will create a datasource called
'HMIS Data Source', a role 'HMIS Administrator', and grant admin access to the first non-system user.

```sh
rails db:seed
```

## Administration

The above will enable the warehouse API and grant a user access to
[HMIS Admin](https://hmis-warehouse.dev.test/hmis_admin/roles) in the
right-rail of the warehouse UI, and the remaining configuration is done via the UI.

### Granting Access To Data

In order for a user to have any access to HMIS data, they must be granted access
via one or more _groups_. Which are configured via
[HMIS Groups Administration](https://hmis-warehouse.dev.test/hmis_admin/groups).

For development, it is suggested to create a group 'Developers' with the permission
scope 'Viewable and Editable', assign the data source 'HMIS Data Source', and assign
the development administrator to this group.

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

To pick up the schema changes on the frontend, follow [this step](https://github.com/greenriver/hmis-frontend/commit/015176f04ce93c6a54dce4842acccf43d3879968).
