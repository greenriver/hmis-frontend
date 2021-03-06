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

1. Install npm dependencies

   ```sh
   yarn install
   ```

2. Create local certs for development (only need to do this once)

   ```sh
   brew install mkcert
   mkcert -install
   yarn cert
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

Preview staging build

```sh
yarn build:staging && yarn preview
```

Preview production build

```sh
yarn build && yarn preview
```
