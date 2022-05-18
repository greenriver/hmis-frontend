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

### Set up Pre-Commit hooks

```sh
yarn dlx husky-init --yarn2 && yarn
```
