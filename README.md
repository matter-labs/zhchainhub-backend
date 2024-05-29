# zkChainHub

## Description

The zkChainHub project for zkSync involves the creation of a comprehensive data management system. This project is designed to provide key insights into the zkSync network, making it an invaluable tool for users and developers.

## Packages

-   `@zkchainhub/serverless`: Includes all serverless functions from the repository.

## Dev Environment

Installing and building packages can be done through the following command:

```
yarn && yarn build
```

Here `yarn`: Install deps, create symlinks, hoist packages.
And `yarn build` Build all packages.

Address changes for each package can be done the following way:

```
yarn workspace @zkchainhub/serverless dev
```

## Running tests

To test for the complete repository run:

```
yarn build && yarn test
```

For testing individual packages:

```
yarn workspace @huperhub/serverless build
yarn workspace @zkchainhub/serverless test
```

## Creating a new package

<!-- //TODO: add a boilerplate tool -->

Creating a new package can be replicated from already existing packages structure.

## Installing dependencies

For global dependencies:

```
yarn add ethers
```

Adding new dependencies should be done from root level, and not from each package.
For example:

```
yarn workspace @zkchainhub/serverless add ethers
```
