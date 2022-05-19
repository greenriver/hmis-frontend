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

### Run locally

Run dev server with live reload

```
yarn dev
```

Preview staging build

```
yarn build:staging && yarn preview
```

Preview production build

```
yarn build && yarn preview
```

Testing, linting, formatting, and type checking

```
yarn test
yarn lint
yarn format
yarn tsc
```

Set up pre-commit hooks to automatically fix lint and formatting issues

```sh
yarn dlx husky-init --yarn2 && yarn
```
