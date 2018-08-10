# contract-explorer

The goal of this project is to create a web UI that provides visibility into the properties and behavior of Maker smart contracts.

## Usage

```js
yarn install
yarn start
```

This will start a web server at `localhost:9000`. When you open this address in a browser (which the code will attempt to do automatically), it will run through some basic CDP operations so that you can see how values in the `tub` contract change.

It expects to find a JSON-RPC Web3 provider at `localhost:2000`. You can use our testchain script in [dai.js](https://github.com/makerdao/dai.js) for this.
