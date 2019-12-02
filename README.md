# Climate Connect

## Getting Started

1. Clone down the repo
2. Run `yarn` to download all NPM packages
3. Start a Postgres server with `docker run --publish 5432:5432 postgres`
4. Run `yarn dev` to start developing
5. All work should be done on a feature branch, based off of the develop branch. For example create
   a new `feature/awesome-new-feature` branch. When completed, sumbit a PR to merge it into the
   `develop` branch. See the
   [Wiki](https://github.com/climateconnect/climateconnect/wiki/Github-Branching-Guidelines) for
   more info

## Testing

To run tests, run `yarn test`.

## To Deploy

1. Run `yarn build` to build our the website
2. ??? Rest of deploy procedure is work in progress
